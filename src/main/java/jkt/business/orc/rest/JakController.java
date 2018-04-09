package jkt.business.orc.rest;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.PostConstruct;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.gson.JsonParser;

import jkt.business.orc.be.google.GeolocationAPI;
import jkt.business.orc.be.google.IbmAPI;
import jkt.business.orc.model.Ambulance;
import jkt.business.orc.model.Puskesmas;
import jkt.business.orc.model.RSKhusus;
import jkt.business.orc.model.RSUmum;

@RestController
public class JakController {
	
	@Autowired
	private GeolocationAPI googleApi;

	@CrossOrigin(origins = "*")
	@RequestMapping(
			value ="/api/psk",
			method=RequestMethod.GET,
			produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ArrayList<?>> getAllPsk() throws Exception{
		ArrayList<Puskesmas> out= googleApi.getAllPsk();
		return new ResponseEntity<ArrayList<?>>(out, buildHeader(), HttpStatus.OK);

	}

	@CrossOrigin(origins = "*")
	@RequestMapping(
			value ="/api/rsk",
			method=RequestMethod.GET,
			produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ArrayList<?>> getAllRsk() throws Exception{
		ArrayList<RSKhusus> out= googleApi.getAllRsk();

		return new ResponseEntity<ArrayList<?>>(out, buildHeader(), HttpStatus.OK);

	}

	@CrossOrigin(origins = "*")
	@RequestMapping(
			value ="/api/rsu",
			method=RequestMethod.GET,
			produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ArrayList<?>> getAllRsu() throws Exception{

		ArrayList<RSUmum> out= googleApi.getAllRsu();

		return new ResponseEntity<ArrayList<?>>(out, buildHeader(), HttpStatus.OK);
	}

	@CrossOrigin(origins = "*")
	@RequestMapping(
			value ="/api/amb",
			method=RequestMethod.GET,
			produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ArrayList<?>> getAllAmb() throws Exception{

		ArrayList<Ambulance> out= googleApi.getAllAmb();

		return new ResponseEntity<ArrayList<?>>(out, buildHeader(), HttpStatus.OK);
	}

	@CrossOrigin(origins = "*")
	@RequestMapping(
			value ="/api/nearby/psk",
			method=RequestMethod.GET,
			produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ArrayList<?>> getNearbyPsk(
			@RequestParam(value="loc") String locPattern
			) throws Exception{
		ArrayList<Puskesmas> out= googleApi.getNearbyPsk(locPattern);

		return new ResponseEntity<ArrayList<?>>(out, buildHeader(), HttpStatus.OK);

	}

	@CrossOrigin(origins = "*")
	@RequestMapping(
			value ="/api/nearby/rsk",
			method=RequestMethod.GET,
			produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ArrayList<?>> getNearbyRsk(
			@RequestParam(value="loc") String locPattern
			) throws Exception{
		ArrayList<RSKhusus> out= googleApi.getNearbyRsk(locPattern);

		return new ResponseEntity<ArrayList<?>>(out, buildHeader(), HttpStatus.OK);

	}

	@CrossOrigin(origins = "*")
	@RequestMapping(
			value ="/api/nearby/rsu",
			method=RequestMethod.GET,
			produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ArrayList<?>> getNearbyRsu(
			@RequestParam(value="loc") String locPattern
			) throws Exception{
		ArrayList<RSUmum> out= googleApi.getNearbyRsu(locPattern);
		return new ResponseEntity<ArrayList<?>>(out, buildHeader(), HttpStatus.OK);
	}

	@CrossOrigin(origins = "*")
	@RequestMapping(
			value ="/api/nearby/amb",
			method=RequestMethod.GET,
			produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ArrayList<?>> getNearbyAmb(
			@RequestParam(value="loc") String locPattern
			) throws Exception{
		ArrayList<Ambulance> out= googleApi.getNearbyAmb(locPattern);

		return new ResponseEntity<ArrayList<?>>(out, buildHeader(), HttpStatus.OK);
	}

	@CrossOrigin(origins = "*")
	@RequestMapping(
			value ="/api/route1",
			method=RequestMethod.GET,
			produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<String> getRoute1(
			@RequestParam(value="loc") String loc,
			@RequestParam(value="dlat") String dlat,
			@RequestParam(value="dlng") String dlng
			) throws Exception{
		String out= ibmApi.getRoute(loc, dlat, dlng);

		return new ResponseEntity<String>(out, buildHeader(), HttpStatus.OK);
	}

	@CrossOrigin(origins = "*")
	@RequestMapping(
			value ="/api/route2",
			method=RequestMethod.GET,
			produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<String> getRoute2(
			@RequestParam(value="olat") String olat,
			@RequestParam(value="olng") String olng,
			@RequestParam(value="dlat") String dlat,
			@RequestParam(value="dlng") String dlng
			) throws Exception{
		String out= ibmApi.getRoute(olat, olng, dlat, dlng);

		return new ResponseEntity<String>(out, buildHeader(), HttpStatus.OK);
	}

	@CrossOrigin(origins = "*")
	@RequestMapping(
			value ="/api/weather",
			method=RequestMethod.GET,
			produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<Map> getRoute(
			@RequestParam(value="lat") String lat,
			@RequestParam(value="lng") String lng
			) throws Exception{
		Map<?, ?> out= ibmApi.getWeather(lat, lng);

		return new ResponseEntity<Map>(out, buildHeader(), HttpStatus.OK);
	}

	private HttpHeaders buildHeader(){
		HttpHeaders headers = new HttpHeaders();
		headers.add("Access-Control-Allow-Origin", "*");
		headers.add("Access-Control-Allow-Methods", "GET, POST, DELETE, PUT, OPTIONS");
		headers.add("Access-Control-Allow-Headers", "X-Requested-With, Content-Type, X-Codingpedia,Authorization");
		return headers;
	}
}