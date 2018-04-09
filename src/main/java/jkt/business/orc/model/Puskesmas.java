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
	"nama_Puskesmas",
	"location",
	"telepon",
	"faximile",
	"email",
	"kepala_puskesmas",
	"kode_kota",
	"kode_kecamatan",
	"kode_kelurahan"
})
public class Puskesmas implements Comparable<Puskesmas>{

	@JsonProperty("id")
	private Long id;
	@JsonProperty("nama_Puskesmas")
	private String namaPuskesmas;
	@JsonProperty("location")
	private Location location;
	@JsonProperty("telepon")
	private List<String> telepon = null;
	@JsonProperty("faximile")
	private List<String> faximile = null;
	@JsonProperty("email")
	private String email;
	@JsonProperty("kepala_puskesmas")
	private String kepalaPuskesmas;
	@JsonProperty("kode_kota")
	private Long kodeKota;
	@JsonProperty("kode_kecamatan")
	private Long kodeKecamatan;
	@JsonProperty("kode_kelurahan")
	private Long kodeKelurahan;
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

	@JsonProperty("nama_Puskesmas")
	public String getNamaPuskesmas() {
		return namaPuskesmas;
	}

	@JsonProperty("nama_Puskesmas")
	public void setNamaPuskesmas(String namaPuskesmas) {
		this.namaPuskesmas = namaPuskesmas;
	}

	@JsonProperty("location")
	public Location getLocation() {
		return location;
	}

	@JsonProperty("location")
	public void setLocation(Location location) {
		this.location = location;
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

	@JsonProperty("email")
	public String getEmail() {
		return email;
	}

	@JsonProperty("email")
	public void setEmail(String email) {
		this.email = email;
	}

	@JsonProperty("kepala_puskesmas")
	public String getKepalaPuskesmas() {
		return kepalaPuskesmas;
	}

	@JsonProperty("kepala_puskesmas")
	public void setKepalaPuskesmas(String kepalaPuskesmas) {
		this.kepalaPuskesmas = kepalaPuskesmas;
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
    public int compareTo(Puskesmas compare) {
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
