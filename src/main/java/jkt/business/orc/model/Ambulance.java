package jkt.business.orc.model;

import java.util.HashMap;
import java.util.Map;
import com.fasterxml.jackson.annotation.JsonAnyGetter;
import com.fasterxml.jackson.annotation.JsonAnySetter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;

@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonPropertyOrder({
	"NO",
	"GPSSTATE",
	"GPS",
	"TIME",
	"USERNAME",
	"TIME_FORMAT",
	"LICENSE",
	"TERMINAL",
	"OWNERTELP",
	"OWNERNAME",
	"TYPE",
	"LONGITUDE",
	"LATITUDE",
	"ADDRESS",
	"SPEED",
	"DIRECTION",
	"MILEAGE",
	"ALARMSTATE",
	"CARSTATE",
	"ICONID",
	"GSM",
	"STATUS",
	"STATUS_ENGINE",
	"EXP_DATE",
	"STATUS_EXP",
	"VEHICLE_STATE",
	"VEHICLE_TYPE"
})
public class Ambulance implements Comparable<Ambulance>{

	@JsonProperty("NO")
	private Integer nO;
	@JsonProperty("GPSSTATE")
	private String gPSSTATE;
	@JsonProperty("GPS")
	private Integer gPS;
	@JsonProperty("TIME")
	private Integer tIME;
	@JsonProperty("USERNAME")
	private String uSERNAME;
	@JsonProperty("TIME_FORMAT")
	private String tIMEFORMAT;
	@JsonProperty("LICENSE")
	private String lICENSE;
	@JsonProperty("TERMINAL")
	private String tERMINAL;
	@JsonProperty("OWNERTELP")
	private String oWNERTELP;
	@JsonProperty("OWNERNAME")
	private String oWNERNAME;
	@JsonProperty("TYPE")
	private String tYPE;
	@JsonProperty("LONGITUDE")
	private String lONGITUDE;
	@JsonProperty("LATITUDE")
	private String lATITUDE;
	@JsonProperty("ADDRESS")
	private String aDDRESS;
	@JsonProperty("SPEED")
	private Integer sPEED;
	@JsonProperty("DIRECTION")
	private Integer dIRECTION;
	@JsonProperty("MILEAGE")
	private Integer mILEAGE;
	@JsonProperty("ALARMSTATE")
	private Integer aLARMSTATE;
	@JsonProperty("CARSTATE")
	private Integer cARSTATE;
	@JsonProperty("ICONID")
	private String iCONID;
	@JsonProperty("GSM")
	private String gSM;
	@JsonProperty("STATUS")
	private String sTATUS;
	@JsonProperty("STATUS_ENGINE")
	private String sTATUSENGINE;
	@JsonProperty("EXP_DATE")
	private String eXPDATE;
	@JsonProperty("STATUS_EXP")
	private String sTATUSEXP;
	@JsonProperty("VEHICLE_STATE")
	private String vEHICLESTATE;
	@JsonProperty("VEHICLE_TYPE")
	private String vEHICLETYPE;
	@JsonIgnore
	private Map<String, Object> additionalProperties = new HashMap<String, Object>();

	@JsonProperty("NO")
	public Integer getNO() {
		return nO;
	}

	@JsonProperty("NO")
	public void setNO(Integer nO) {
		this.nO = nO;
	}

	@JsonProperty("GPSSTATE")
	public String getGPSSTATE() {
		return gPSSTATE;
	}

	@JsonProperty("GPSSTATE")
	public void setGPSSTATE(String gPSSTATE) {
		this.gPSSTATE = gPSSTATE;
	}

	@JsonProperty("GPS")
	public Integer getGPS() {
		return gPS;
	}

	@JsonProperty("GPS")
	public void setGPS(Integer gPS) {
		this.gPS = gPS;
	}

	@JsonProperty("TIME")
	public Integer getTIME() {
		return tIME;
	}

	@JsonProperty("TIME")
	public void setTIME(Integer tIME) {
		this.tIME = tIME;
	}

	@JsonProperty("USERNAME")
	public String getUSERNAME() {
		return uSERNAME;
	}

	@JsonProperty("USERNAME")
	public void setUSERNAME(String uSERNAME) {
		this.uSERNAME = uSERNAME;
	}

	@JsonProperty("TIME_FORMAT")
	public String getTIMEFORMAT() {
		return tIMEFORMAT;
	}

	@JsonProperty("TIME_FORMAT")
	public void setTIMEFORMAT(String tIMEFORMAT) {
		this.tIMEFORMAT = tIMEFORMAT;
	}

	@JsonProperty("LICENSE")
	public String getLICENSE() {
		return lICENSE;
	}

	@JsonProperty("LICENSE")
	public void setLICENSE(String lICENSE) {
		this.lICENSE = lICENSE;
	}

	@JsonProperty("TERMINAL")
	public String getTERMINAL() {
		return tERMINAL;
	}

	@JsonProperty("TERMINAL")
	public void setTERMINAL(String tERMINAL) {
		this.tERMINAL = tERMINAL;
	}

	@JsonProperty("OWNERTELP")
	public String getOWNERTELP() {
		return oWNERTELP;
	}

	@JsonProperty("OWNERTELP")
	public void setOWNERTELP(String oWNERTELP) {
		this.oWNERTELP = oWNERTELP;
	}

	@JsonProperty("OWNERNAME")
	public String getOWNERNAME() {
		return oWNERNAME;
	}

	@JsonProperty("OWNERNAME")
	public void setOWNERNAME(String oWNERNAME) {
		this.oWNERNAME = oWNERNAME;
	}

	@JsonProperty("TYPE")
	public String getTYPE() {
		return tYPE;
	}

	@JsonProperty("TYPE")
	public void setTYPE(String tYPE) {
		this.tYPE = tYPE;
	}

	@JsonProperty("LONGITUDE")
	public String getLONGITUDE() {
		return lONGITUDE;
	}

	@JsonProperty("LONGITUDE")
	public void setLONGITUDE(String lONGITUDE) {
		this.lONGITUDE = lONGITUDE;
	}

	@JsonProperty("LATITUDE")
	public String getLATITUDE() {
		return lATITUDE;
	}

	@JsonProperty("LATITUDE")
	public void setLATITUDE(String lATITUDE) {
		this.lATITUDE = lATITUDE;
	}

	@JsonProperty("ADDRESS")
	public String getADDRESS() {
		return aDDRESS;
	}

	@JsonProperty("ADDRESS")
	public void setADDRESS(String aDDRESS) {
		this.aDDRESS = aDDRESS;
	}

	@JsonProperty("SPEED")
	public Integer getSPEED() {
		return sPEED;
	}

	@JsonProperty("SPEED")
	public void setSPEED(Integer sPEED) {
		this.sPEED = sPEED;
	}

	@JsonProperty("DIRECTION")
	public Integer getDIRECTION() {
		return dIRECTION;
	}

	@JsonProperty("DIRECTION")
	public void setDIRECTION(Integer dIRECTION) {
		this.dIRECTION = dIRECTION;
	}

	@JsonProperty("MILEAGE")
	public Integer getMILEAGE() {
		return mILEAGE;
	}

	@JsonProperty("MILEAGE")
	public void setMILEAGE(Integer mILEAGE) {
		this.mILEAGE = mILEAGE;
	}

	@JsonProperty("ALARMSTATE")
	public Integer getALARMSTATE() {
		return aLARMSTATE;
	}

	@JsonProperty("ALARMSTATE")
	public void setALARMSTATE(Integer aLARMSTATE) {
		this.aLARMSTATE = aLARMSTATE;
	}

	@JsonProperty("CARSTATE")
	public Integer getCARSTATE() {
		return cARSTATE;
	}

	@JsonProperty("CARSTATE")
	public void setCARSTATE(Integer cARSTATE) {
		this.cARSTATE = cARSTATE;
	}

	@JsonProperty("ICONID")
	public String getICONID() {
		return iCONID;
	}

	@JsonProperty("ICONID")
	public void setICONID(String iCONID) {
		this.iCONID = iCONID;
	}

	@JsonProperty("GSM")
	public String getGSM() {
		return gSM;
	}

	@JsonProperty("GSM")
	public void setGSM(String gSM) {
		this.gSM = gSM;
	}

	@JsonProperty("STATUS")
	public String getSTATUS() {
		return sTATUS;
	}

	@JsonProperty("STATUS")
	public void setSTATUS(String sTATUS) {
		this.sTATUS = sTATUS;
	}

	@JsonProperty("STATUS_ENGINE")
	public String getSTATUSENGINE() {
		return sTATUSENGINE;
	}

	@JsonProperty("STATUS_ENGINE")
	public void setSTATUSENGINE(String sTATUSENGINE) {
		this.sTATUSENGINE = sTATUSENGINE;
	}

	@JsonProperty("EXP_DATE")
	public String getEXPDATE() {
		return eXPDATE;
	}

	@JsonProperty("EXP_DATE")
	public void setEXPDATE(String eXPDATE) {
		this.eXPDATE = eXPDATE;
	}

	@JsonProperty("STATUS_EXP")
	public String getSTATUSEXP() {
		return sTATUSEXP;
	}

	@JsonProperty("STATUS_EXP")
	public void setSTATUSEXP(String sTATUSEXP) {
		this.sTATUSEXP = sTATUSEXP;
	}

	@JsonProperty("VEHICLE_STATE")
	public String getVEHICLESTATE() {
		return vEHICLESTATE;
	}

	@JsonProperty("VEHICLE_STATE")
	public void setVEHICLESTATE(String vEHICLESTATE) {
		this.vEHICLESTATE = vEHICLESTATE;
	}

	@JsonProperty("VEHICLE_TYPE")
	public String getVEHICLETYPE() {
		return vEHICLETYPE;
	}

	@JsonProperty("VEHICLE_TYPE")
	public void setVEHICLETYPE(String vEHICLETYPE) {
		this.vEHICLETYPE = vEHICLETYPE;
	}

	@JsonAnyGetter
	public Map<String, Object> getAdditionalProperties() {
		return this.additionalProperties;
	}

	@JsonAnySetter
	public void setAdditionalProperty(String name, Object value) {
		this.additionalProperties.put(name, value);
	}
	
	@JsonProperty("distance")
	private Double distance;
	
	@JsonProperty("distance")
	public Double getDistance() {
		return distance;
	}

	@JsonProperty("distance")
	public void setDistance(Double distance) {
		this.distance = distance;
	}
	
	@Override
    public int compareTo(Ambulance compare) {
        Double compareDistance = compare.getDistance();
        /* For Ascending order*/
        if(this.getDistance() - compareDistance > 0){
        	return 1;
        } else if(this.getDistance() - compareDistance < 0){
        	return -1;
        }
        return 0;
    }

}
