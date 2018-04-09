package jkt.business.orc.model;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import com.fasterxml.jackson.annotation.JsonAnyGetter;
import com.fasterxml.jackson.annotation.JsonAnySetter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;

@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonPropertyOrder({
	"id",
	"nama_rsk",
	"jenis_rsk",
	"location",
	"kode_pos",
	"telepon",
	"faximile",
	"website",
	"email",
	"kode_kota",
	"kode_kecamatan",
	"kode_kelurahan",
	"latitude",
	"longitude"
})
public class RSKhusus implements Comparable<RSKhusus>{

	@JsonProperty("id")
	private Long id;
	@JsonProperty("nama_rsk")
	private String namaRsk;
	@JsonProperty("jenis_rsk")
	private String jenisRsk;
	@JsonProperty("location")
	private Location location;
	@JsonProperty("kode_pos")
	private Long kodePos;
	@JsonProperty("telepon")
	private List<String> telepon = null;
	@JsonProperty("faximile")
	private List<String> faximile = null;
	@JsonProperty("website")
	private String website;
	@JsonProperty("email")
	private String email;
	@JsonProperty("kode_kota")
	private Long kodeKota;
	@JsonProperty("kode_kecamatan")
	private Long kodeKecamatan;
	@JsonProperty("kode_kelurahan")
	private Long kodeKelurahan;
	@JsonProperty("latitude")
	private Double latitude;
	@JsonProperty("longitude")
	private Double longitude;
	@JsonIgnore
	private Map<String, Object> additionalProperties = new HashMap<String, Object>();

	@JsonProperty("id")
	public Long getId() {
		return id;
	}

	@JsonProperty("id")
	public void setId(Long id) {
		this.id = id;
	}

	@JsonProperty("nama_rsk")
	public String getNamaRsk() {
		return namaRsk;
	}

	@JsonProperty("nama_rsk")
	public void setNamaRsk(String namaRsk) {
		this.namaRsk = namaRsk;
	}

	@JsonProperty("jenis_rsk")
	public String getJenisRsk() {
		return jenisRsk;
	}

	@JsonProperty("jenis_rsk")
	public void setJenisRsk(String jenisRsk) {
		this.jenisRsk = jenisRsk;
	}

	@JsonProperty("location")
	public Location getLocation() {
		return location;
	}

	@JsonProperty("location")
	public void setLocation(Location location) {
		this.location = location;
	}

	@JsonProperty("kode_pos")
	public Long getKodePos() {
		return kodePos;
	}

	@JsonProperty("kode_pos")
	public void setKodePos(Long kodePos) {
		this.kodePos = kodePos;
	}

	@JsonProperty("telepon")
	public List<String> getTelepon() {
		return telepon;
	}

	@JsonProperty("telepon")
	public void setTelepon(List<String> telepon) {
		this.telepon = telepon;
	}

	@JsonProperty("faximile")
	public List<String> getFaximile() {
		return faximile;
	}

	@JsonProperty("faximile")
	public void setFaximile(List<String> faximile) {
		this.faximile = faximile;
	}

	@JsonProperty("website")
	public String getWebsite() {
		return website;
	}

	@JsonProperty("website")
	public void setWebsite(String website) {
		this.website = website;
	}

	@JsonProperty("email")
	public String getEmail() {
		return email;
	}

	@JsonProperty("email")
	public void setEmail(String email) {
		this.email = email;
	}

	@JsonProperty("kode_kota")
	public Long getKodeKota() {
		return kodeKota;
	}

	@JsonProperty("kode_kota")
	public void setKodeKota(Long kodeKota) {
		this.kodeKota = kodeKota;
	}

	@JsonProperty("kode_kecamatan")
	public Long getKodeKecamatan() {
		return kodeKecamatan;
	}

	@JsonProperty("kode_kecamatan")
	public void setKodeKecamatan(Long kodeKecamatan) {
		this.kodeKecamatan = kodeKecamatan;
	}

	@JsonProperty("kode_kelurahan")
	public Long getKodeKelurahan() {
		return kodeKelurahan;
	}

	@JsonProperty("kode_kelurahan")
	public void setKodeKelurahan(Long kodeKelurahan) {
		this.kodeKelurahan = kodeKelurahan;
	}

	@JsonProperty("latitude")
	public Double getLatitude() {
		return latitude;
	}

	@JsonProperty("latitude")
	public void setLatitude(Double latitude) {
		this.latitude = latitude;
	}

	@JsonProperty("longitude")
	public Double getLongitude() {
		return longitude;
	}

	@JsonProperty("longitude")
	public void setLongitude(Double longitude) {
		this.longitude = longitude;
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
    public int compareTo(RSKhusus compare) {
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
