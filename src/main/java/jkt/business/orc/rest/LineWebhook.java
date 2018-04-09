package jkt.business.orc.rest;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.Date;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Timer;
import java.util.TimerTask;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import javax.servlet.http.HttpServletRequest;

import org.apache.tomcat.util.codec.binary.Base64;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.linecorp.bot.client.LineMessagingServiceBuilder;
import com.linecorp.bot.model.PushMessage;
import com.linecorp.bot.model.action.Action;
import com.linecorp.bot.model.action.DatetimePickerAction;
import com.linecorp.bot.model.action.MessageAction;
import com.linecorp.bot.model.action.PostbackAction;
import com.linecorp.bot.model.action.URIAction;
import com.linecorp.bot.model.message.ImageMessage;
import com.linecorp.bot.model.message.Message;
import com.linecorp.bot.model.message.StickerMessage;
import com.linecorp.bot.model.message.TemplateMessage;
import com.linecorp.bot.model.message.TextMessage;
import com.linecorp.bot.model.message.VideoMessage;
import com.linecorp.bot.model.message.template.ButtonsTemplate;
import com.linecorp.bot.model.message.template.CarouselColumn;
import com.linecorp.bot.model.message.template.CarouselTemplate;
import com.linecorp.bot.model.message.template.ConfirmTemplate;
import com.linecorp.bot.model.message.template.ImageCarouselColumn;
import com.linecorp.bot.model.message.template.ImageCarouselTemplate;
import com.linecorp.bot.model.profile.UserProfileResponse;
import com.linecorp.bot.model.response.BotApiResponse;

import jkt.business.orc.be.google.GeolocationAPI;
import jkt.business.orc.be.google.IbmAPI;
import jkt.business.orc.model.Ambulance;
import jkt.business.orc.model.Puskesmas;
import jkt.business.orc.model.RSKhusus;
import jkt.business.orc.model.RSUmum;
import jkt.business.utility.UserFlow;
import retrofit2.Response;

@RestController
@RequestMapping("/hook/line")
public class LineWebhook {

	@Autowired private GeolocationAPI googleApi;
	@Autowired private IbmAPI ibmApi;
	@Autowired private UserFlow userFlow;
	@Value("${line.channel.secret}") private String lineChannelSecret;
	@Value("${line.channel.access.token}") private String lineChannelAccessToken;
	private SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm");

	private boolean isMessageSupported(String rawJson){
		JsonElement json = new JsonParser().parse(rawJson);
		JsonObject eventObject = json.getAsJsonObject();

		for(JsonElement event:eventObject.getAsJsonObject().getAsJsonArray("events")){
			JsonObject source = event.getAsJsonObject().get("source").getAsJsonObject();
			if(source.get("type").getAsString().equals("user")){
				switch(event.getAsJsonObject().get("type").getAsString()){
				case "message": 
					return true;
				case "postback": 
					return true;
				case "follow": 
					return true;
				}
			}
		}
		return false;
	}

	private boolean verifyRequest(String xLineSignature, String httpRequestBody){
		//		Log.getLogger().debug(xLineSignature+" "+lineChannelSecret);
		SecretKeySpec key = new SecretKeySpec(lineChannelSecret.getBytes(), "HmacSHA256");
		Mac mac;
		try {
			mac = Mac.getInstance("HmacSHA256");
			mac.init(key);
			byte[] source = httpRequestBody.getBytes("UTF-8");
			String signature = Base64.encodeBase64String(mac.doFinal(source));
			//			System.out.printf("X-Line-Signature: %s, Signature:%s\n",xLineSignature ,signature);
			return xLineSignature
					.equals(signature);
		} catch (NoSuchAlgorithmException e) {
			e.printStackTrace();
			return false;
		} catch (InvalidKeyException e) {
			e.printStackTrace();
			return false;
		} catch (UnsupportedEncodingException e) {
			e.printStackTrace();
			return false;
		} catch (NullPointerException e) { 
			e.printStackTrace();
			return false;
		} 
	}

	private String getUserID(String rawJson){
		JsonElement json = new JsonParser().parse(rawJson);
		JsonObject eventObject = json.getAsJsonObject();
		String userID = "";
		for(JsonElement event:eventObject.getAsJsonObject().getAsJsonArray("events")){
			JsonObject source = event.getAsJsonObject().get("source").getAsJsonObject();
			if(source.get("type").getAsString().equals("user")){
				userID = source.get("userId").getAsString();
			}
		}

		return userID;
	}

	private String getUserName(String userID) throws IOException{

		Response<UserProfileResponse> response = null;
		response = LineMessagingServiceBuilder
				.create(lineChannelAccessToken)
				.build()
				.getProfile(userID)
				.execute();

		if (response.isSuccessful()) {
			UserProfileResponse profile = response.body();
			return profile.getDisplayName();
		} else {
			return "";
		}
	}

	@RequestMapping(method=RequestMethod.POST)
	public ResponseEntity<String> processRequest(@Autowired(required=true) HttpServletRequest request, @RequestBody String rawJson) throws IOException {
		System.out.println("RECEIVE LINE REQ "+rawJson);

		if(verifyRequest(request.getHeader("x-line-signature"), rawJson)){
			if(isMessageSupported(rawJson)){
				String userID = getUserID(rawJson);
				String userName = getUserName(userID);

				userName = userName.replaceAll("\n", " ");
				userName = userName.replaceAll("\t", " ");
				userName = userName.replaceAll("\\\\", " ");
				userName = userName.replaceAll("\"", " ");

				String msgContent = handleMessage(rawJson);

				ArrayList<Message> responseMessages = new ArrayList<Message>();
				try {
					responseMessages = processMessage(userID, userName, msgContent, responseMessages);
				} catch (Exception e) {
					e.printStackTrace();
				}

				if(responseMessages.size() > 0){
					sendToLine(new PushMessage(userID, responseMessages));
				}
			}
			return ResponseEntity.ok(null);
		}else{
			return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Invalid LINE Request!");
		}
	}

	private final String COORDINATE_REGEX = "lat:-?[0-9]+(\\.[0-9]+)?,lng:-?[0-9]+(\\.[0-9]+)?";
	private Pattern pattern;
	private Matcher matcher;

	private final String[] sadEmoji = {"1-9","1-16","1-135","1-424","2-32","2-152","2-153","2-154","2-174","2-524"};
	private final String[] happyEmoji = {"1-2","1-4","1-5","1-106","1-124","1-125","1-134","2-172","2-516","1-407"};

	private final String[] sadSticker = {"1-9","1-16","1-135","1-424","2-32","2-152","2-153","2-154","2-174","2-524"};
	private final String[] happySticker = {"1-2","1-4","1-5","1-106","1-124","1-125","1-134","2-172","2-516","1-407"};

	private final String[] niceResp = {"Keren ya %s yang Kamu kirim %s",
			"Wah koleksi %s Kamu bagus ya %s",
	"Hmm, menarik ya %snya %s"};

	private final String[] yesResp = {"Iya sama-sama ya %s",
	"Oke deh kalau begitu %s"};

	private final String[] noResp = {"Iya nggak apa-apa %s",
	"Oke deh kalau begitu %s"};

	private final String GREETING_WORDS_REGEX = "hai|halo|helo|hei|woi|woy|boy|coy|hallo|hello|bro|sis|boi|bos";
	private final String AMB_WORDS_REGEX = "ambulan";
	private final String PSK_WORDS_REGEX = "puskesmas|psk|mas|kes|dokter";
	private final String RSU_WORDS_REGEX = "rumah|sakit|rmh|skt|skit|umum|rsu|mum";
	private final String RSK_WORDS_REGEX = "khusus|sus|paru|bedah|darah|kardio|jantung|kanker|mata|tht|gigi|ibu|anak|telinga|hidung|tenggorokan|mulut|jiwa";

	private boolean isGreeting(String text) {
		pattern = Pattern.compile(GREETING_WORDS_REGEX, Pattern.CASE_INSENSITIVE);
		matcher = pattern.matcher(text);
		return matcher.find();
	}

	private boolean isAmb(String text) {
		pattern = Pattern.compile(AMB_WORDS_REGEX, Pattern.CASE_INSENSITIVE);
		matcher = pattern.matcher(text);
		return matcher.find();
	}

	private boolean isPsk(String text) {
		pattern = Pattern.compile(PSK_WORDS_REGEX, Pattern.CASE_INSENSITIVE);
		matcher = pattern.matcher(text);
		return matcher.find();
	}

	private boolean isRsu(String text) {
		pattern = Pattern.compile(RSU_WORDS_REGEX, Pattern.CASE_INSENSITIVE);
		matcher = pattern.matcher(text);
		return matcher.find();
	}

	private boolean isRsk(String text) {
		pattern = Pattern.compile(RSK_WORDS_REGEX, Pattern.CASE_INSENSITIVE);
		matcher = pattern.matcher(text);
		return matcher.find();
	}

	private ArrayList<Message> processMessage(String userID, String userName, String msgContent, ArrayList<Message> responseMessages) throws Exception {
		if(msgContent.indexOf("QaZ!") > -1){
			ArrayList<CarouselColumn> bubbleTemplate = new ArrayList<CarouselColumn>();
			ArrayList<Action> buttonTemplate = new ArrayList<Action>();
			buttonTemplate.add(new URIAction("See", imgUrl));
			
			bubbleTemplate.add(createBubble("Title","Subtitle",imgUrl,buttonTemplate));
			responseMessages.add(replyCarouselTemplate(userID, "Testingg", bubbleTemplate));
		}else if(msgContent.equalsIgnoreCase("batal")){
			userFlow.removeUserFlows(userID);
			responseMessages.add(replyImageCarousel(userID, createMenu()));
		} else {
			pattern = Pattern.compile(COORDINATE_REGEX);
			matcher = pattern.matcher(msgContent);
			
			switch(msgContent){
			case "STICKER_CONT3NT": 
				responseMessages.add(replyTextMessage(userID, String.format(niceResp[(int)(Math.random()*(niceResp.length-1))], "sticker", ":D")));
				responseMessages.add(replySticker(userID, happySticker[(int)(Math.random()*(happySticker.length-1))]));
				break;
			case "IMAGE_CONT3NT": 
				responseMessages.add(replyTextMessage(userID, String.format(niceResp[(int)(Math.random()*(niceResp.length-1))], "gambar", ":D")));
				responseMessages.add(replySticker(userID, happySticker[(int)(Math.random()*(happySticker.length-1))]));
				break;
			case "VIDEO_CONT3NT": 
				responseMessages.add(replyTextMessage(userID, String.format(niceResp[(int)(Math.random()*(niceResp.length-1))], "video", ":D")));
				responseMessages.add(replySticker(userID, happySticker[(int)(Math.random()*(happySticker.length-1))]));
				break;
			case "AUDIO_CONT3NT": 
				responseMessages.add(replyTextMessage(userID, String.format(niceResp[(int)(Math.random()*(niceResp.length-1))], "audio", ":D")));
				responseMessages.add(replySticker(userID, happySticker[(int)(Math.random()*(happySticker.length-1))]));
				break;
			case "FOLLOW_EV3NT": 
				responseMessages.add(replyTextMessage(userID, String.format(welcomeResp[(int)(Math.random()*(welcomeResp.length-1))], userName, ":D")));
				responseMessages.add(replySticker(userID, happySticker[(int)(Math.random()*(happySticker.length-1))]));
				responseMessages.add(replyImageCarousel(userID, createMenu()));
				break;
			case "NOT_SUPPORTED_MESSAGE": 
				responseMessages.add(replyTextMessage(userID, String.format(dunnoResp[(int)(Math.random()*(dunnoResp.length-1))], userName, ":(")));
				responseMessages.add(replySticker(userID, sadSticker[(int)(Math.random()*(sadSticker.length-1))]));
				responseMessages.add(replyImageCarousel(userID, createMenu()));
				break;
			default:
				if(msgContent.equalsIgnoreCase("hi") || msgContent.equalsIgnoreCase("oi") || msgContent.equalsIgnoreCase("oy") || 
						isGreeting(msgContent)){

					responseMessages.add(replyTextMessage(userID, String.format(hiResp[(int)(Math.random()*(hiResp.length-1))], userName, ":D")));
					responseMessages.add(replySticker(userID, happySticker[(int)(Math.random()*(happySticker.length-1))]));
					responseMessages.add(replyImageCarousel(userID, createMenu()));
				} else {
					
				}
				break;
			}
		}

		return responseMessages;
	}

	public String handleMessage(String jsonInput){
		String msgContent = "NOT_SUPPORTED_MESSAGE";

		JsonElement json = new JsonParser().parse(jsonInput);
		JsonObject eventObject = json.getAsJsonObject();

		for(JsonElement event:eventObject.getAsJsonObject().getAsJsonArray("events")){
			JsonObject source = event.getAsJsonObject().get("source").getAsJsonObject();
			if(source.get("type").getAsString().equals("user")){
				switch(event.getAsJsonObject().get("type").getAsString()){
				case "message": 
					switch(event.getAsJsonObject().get("message").getAsJsonObject().get("type").getAsString()){
					case "text":
						String inpText = event.getAsJsonObject().get("message").getAsJsonObject().get("text").getAsString();
						msgContent = inpText; break;
					case "location":
						msgContent = "lat:"+event.getAsJsonObject().get("message").getAsJsonObject().get("latitude").getAsDouble()+",lng:"+event.getAsJsonObject().get("message").getAsJsonObject().get("longitude").getAsDouble(); break;
					case "sticker":
						msgContent = "STICKER_CONT3NT"; break;
					case "image":
						msgContent = "IMAGE_CONT3NT"; break;
					case "video":
						msgContent = "VIDEO_CONT3NT"; break;
					case "audio":
						msgContent = "AUDIO_CONT3NT"; break;
					case "file": break;
					}
					break;
				case "postback": 
					msgContent = event.getAsJsonObject().get("postback").getAsJsonObject().get("data").getAsString(); 
					if(msgContent.indexOf("type=remember_me") != -1){
						msgContent += "^"+event.getAsJsonObject().get("postback").getAsJsonObject().get("params").getAsJsonObject().get("datetime").getAsString();
					}
					break;
				case "follow": 
					msgContent = "FOLLOW_EV3NT"; break;
				}
			}
		}

		return msgContent;
	}

	private List<ImageCarouselColumn> createMenu(){
		List<ImageCarouselColumn> columns = new ArrayList<ImageCarouselColumn>();
		columns.add(new ImageCarouselColumn("https://scontent-mxp1-1.xx.fbcdn.net/v/t1.0-9/22050078_100210157402230_1819063388236166970_n.jpg?oh=46b36d933e6961cda0aa03fa121dcb0b&oe=5A48E14E", new MessageAction("Darurat", "Darurat")));
		columns.add(new ImageCarouselColumn("https://scontent-mxp1-1.xx.fbcdn.net/v/t1.0-9/22154603_100210104068902_5548912562483644164_n.jpg?oh=f1f802c8d2d8b8abce266274615d598a&oe=5A523E8C", new MessageAction("Puskesmas", "Puskesmas")));
		columns.add(new ImageCarouselColumn("https://scontent-mxp1-1.xx.fbcdn.net/v/t1.0-9/22154684_100210107402235_779431359135005522_n.jpg?oh=459e98f9f0005ea7a77cbac91a7dd79a&oe=5A7CF31D", new MessageAction("RS Umum", "Rumah Sakit Umum")));
		columns.add(new ImageCarouselColumn("https://scontent-mxp1-1.xx.fbcdn.net/v/t1.0-9/22050157_100210110735568_8262998019391263338_n.jpg?oh=8d49d1018fc243e430d771a0d55b995b&oe=5A871467", new MessageAction("RS Khusus", "Rumah Sakit Khusus")));
		columns.add(new ImageCarouselColumn("https://scontent-mxp1-1.xx.fbcdn.net/v/t1.0-9/22089601_100210134068899_7460678135184823315_n.jpg?oh=56744fd14851be1cee8fff869660717f&oe=5A7DE4C5", new MessageAction("Ambulance", "Ambulance")));
		return columns;
	}

	public StickerMessage replySticker(String recipient, String stickerID) {
		String []sticker = stickerID.split("-");
		return new StickerMessage(sticker[0], sticker[1]);
	}

	public ImageMessage replyImage(String recipient, String imageURL) {
		return new ImageMessage(imageURL, imageURL);
	}

	public TemplateMessage replyImageCarousel(String recipient, List<ImageCarouselColumn> columns){
		ImageCarouselTemplate imgCarouselTemplate = new ImageCarouselTemplate(columns);
		return new TemplateMessage("Menu", imgCarouselTemplate);
	}

	public StickerMessage replyDatePicker(String recipient, String stickerID) {
		String []sticker = stickerID.split("-");
		return new StickerMessage(sticker[0], sticker[1]);
	}

	public TextMessage replyTextMessage(String recipient, String message) {
		return new TextMessage(message);
	}

	public TemplateMessage replyConfirmTemplate(String recipient, String title, List<Action> buttonTemplate){
		ConfirmTemplate template = new ConfirmTemplate(title, buttonTemplate);
		return new TemplateMessage(title, template);
	}

	public TemplateMessage replyNormalButton(String recipient, String identifier, List<Action> buttonTemplate) {
		ButtonsTemplate buttonMessage = new ButtonsTemplate(null, null, identifier, buttonTemplate);
		return new TemplateMessage(identifier, buttonMessage);	
	}

	public TemplateMessage replyCarouselTemplate(String recipient, String title, List<CarouselColumn> bubbleTemplate) {
		CarouselTemplate carouselMessage = new CarouselTemplate(bubbleTemplate);
		return new TemplateMessage(title, carouselMessage);	
	}

	public VideoMessage replyVideo(String recipient, String videoUrl, String thumbnailUrl) {
		return new VideoMessage(videoUrl, thumbnailUrl);
	}

	public CarouselColumn createBubble(String title, String subtitle, String imgUrl, List<Action> buttonTemplate) {
		return new CarouselColumn(imgUrl.replaceAll(" ", "%20"), title, subtitle, buttonTemplate);
	}

	public void sendToLine(PushMessage pushMessage) throws IOException{
		Response<BotApiResponse> response = null;
		try {
			response = LineMessagingServiceBuilder
					.create(lineChannelAccessToken)
					.build()
					.pushMessage(pushMessage)
					.execute();

			try{
				System.out.println(response.errorBody().string());
			}catch(Exception e){}
		} catch (IOException e) {
			throw e;
		}
	}
}
