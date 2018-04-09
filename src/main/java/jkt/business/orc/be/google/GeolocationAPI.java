package jkt.business.orc.be.google;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.UnsupportedEncodingException;
import java.net.URL;
import java.net.URLConnection;
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.annotation.PostConstruct;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.gson.Gson;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import jkt.business.orc.model.Ambulance;
import jkt.business.orc.model.Haversine;
import jkt.business.orc.model.Puskesmas;
import jkt.business.orc.model.RSKhusus;
import jkt.business.orc.model.RSUmum;

@Component
public class GeolocationAPI {

	@PostConstruct
	private void init(){
		
	}

	@Value("${google.maps.api.key}")
	private String apiKey;

	@Value("${google.geolocation.url}")
	private String geolocationUrl;

	@Value("${google.nearby.search.url}")
	private String nearbySearchUrl;

	@Value("${google.place.detail.url}")
	private String placeDetailUrl;

	@Value("${google.distance.matrix.url}")
	private String distanceMatrixUrl;

	@Value("${google.maps.url}")
	private String mapsUrl;

	@Value("${google.maps.image.url}")
	private String mapsImageUrl;

	@Value("${google.search.radius}")
	private String searchRadius;

	private final String SEARCH_KEYWORD = "DKI Jakarta";

	private String getGeolocationUrl(){
		return geolocationUrl + "?address=";
	}

	private String getNearbySearchUrl(){
		return nearbySearchUrl + "?key="+apiKey+ "&radius="+searchRadius
				+ "&keyword="+SEARCH_KEYWORD+ "&location=";
	}

	private String getPlaceDetailUrl(){
		return placeDetailUrl + "?key="+apiKey+"&placeid=";
	}

	private String getDistanceMatrixUrl(){
		return distanceMatrixUrl + "?key="+apiKey;
	}

	private String getGoogleMapsUrl(){
		return mapsUrl + "?q=";
	}

	private String getGoogleMapsImageUrl(){
		return mapsImageUrl;
	}

	private Pattern pattern;
	private Matcher matcher;
	private final String COORDINATE_REGEX = "lat:-?[0-9]+(\\.[0-9]+)?,lng:-?[0-9]+(\\.[0-9]+)?";
	private Gson gson = new Gson();

}