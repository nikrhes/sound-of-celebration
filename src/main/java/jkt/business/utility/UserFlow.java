package jkt.business.utility;

import java.util.HashMap;
import java.util.LinkedList;
import java.util.Map;

import org.springframework.stereotype.Service;

@Service
public class UserFlow {

	private Map<String, LinkedList<String>> userFlows = new HashMap<String, LinkedList<String>>();
	
	public LinkedList<String> getUserFlows(String userID){
		return userFlows.get(userID);
	}
	
	public void setUserFlows(String userID, String flow){
		LinkedList<String> flowList = getUserFlows(userID);
		if(flowList == null){
			flowList = new LinkedList<String>();
		} 
		flowList.addLast(flow);
		userFlows.put(userID, flowList);
	}
	
	public void removeUserFlows(String userID){
		userFlows.remove(userID);
	}
}
