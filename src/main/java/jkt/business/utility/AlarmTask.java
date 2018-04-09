package jkt.business.utility;

import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.TimerTask;

import org.springframework.beans.factory.annotation.Autowired;

import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.linecorp.bot.model.PushMessage;
import com.linecorp.bot.model.action.Action;
import com.linecorp.bot.model.action.URIAction;
import com.linecorp.bot.model.message.Message;

import jkt.business.orc.be.google.IbmAPI;
import jkt.business.orc.rest.LineWebhook;

public class AlarmTask extends TimerTask {

	@Autowired private IbmAPI ibmApi;
	@Autowired private LineWebhook lineWebhook;
	private final String[] happySticker = {"1-2","1-4","1-5","1-106","1-124","1-125","1-134","2-172","2-516","1-407"};
	private String userID;
	private String userName;
	private String payload;
	private Date departDate;
	
	public AlarmTask(String userID, String userName, String payload, Date departDate) {
		super();
		this.userID = userID;
		this.userName = userName;
		this.payload = payload;
		this.departDate = departDate;
	}

	@Override
	public void run() {
		System.out.println("---------ALARM TRIGGERRED----------");
		
		String []content = payload.split("&");
		String lat = content[2];
		String lng = content[3];
		String name = content[4];
		String address = content[5];
		String tels = content[6];
		String distance = content[7];
		String tel = "000000";
		if(!tels.equals("N/A")){
			tel = tels.substring(0, tels.indexOf(" "));
		}

		String identifier = String.format("%s\n%s\nTelp.: %s\nJarak: +/- %s km", name.toUpperCase(), address, tels, distance);
		
		ArrayList<Message> responseMessages = new ArrayList<Message>();
		responseMessages.add(lineWebhook.replyTextMessage(userID, "Hi "+userName+"! Ini udah jam "+new SimpleDateFormat("HH:mm").format(departDate)+", waktunya Kamu berangkat ke "+name+".\n\nUntuk memudahkan Kamu, Bang Jack kasih lagi detailnya ya."));
		
		List<Action> buttonTemplate = new ArrayList<Action>();
		buttonTemplate = new ArrayList<Action>();
		buttonTemplate.add(new URIAction("Telepon","tel:"+tel));
		buttonTemplate.add(new URIAction("Lihat di Google Maps","https://maps.google.com?q="+name.replaceAll(" ", "%20")));
		buttonTemplate.add(new URIAction("Cari di Google","https://www.google.co.id/search?q="+name.replaceAll(" ", "%20")));
		responseMessages.add(lineWebhook.replyNormalButton(userID, identifier, buttonTemplate));
		
		Map<?, ?> result;
		try {
			result = ibmApi.getWeather(lat, lng);
			responseMessages.add(lineWebhook.replyTextMessage(userID, "Oh iya, prakiraan cuaca di daerah ini adalah "+result.get("result")+".\n\nJangan lupa persiapannya sebelum kamu berangkat ya :D"));
		} catch (JsonParseException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (JsonMappingException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
		responseMessages.add(lineWebhook.replyTextMessage(userID, "Jangan lupa dengan barang-barang yang sudah Kamu siapkan dan hati-hati di jalan ya :D"));
		responseMessages.add(lineWebhook.replySticker(userID, happySticker[(int)(Math.random()*(happySticker.length-1))]));
	
		try {
			lineWebhook.sendToLine(new PushMessage(userID, responseMessages));
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}

}
