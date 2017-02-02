import java.util.ArrayList;

import org.bson.types.ObjectId;

import com.mongodb.BasicDBObject;
import com.mongodb.DB;
import com.mongodb.DBCollection;
import com.mongodb.DBCursor;
import com.mongodb.DBObject;
import com.mongodb.MongoClient;

public class TravellingDeliveryMan {

	ArrayList<GPSLocation> locations; 
	ArrayList<GPSLocation> sortedLocations; 
	
	MongoClient mongo;
	DB db ;

	public TravellingDeliveryMan() {
		mongo = new MongoClient( "localhost" , 27017 );
		db = mongo.getDB("ecommerce");

		locations = new ArrayList<GPSLocation>();
		sortedLocations = new ArrayList<GPSLocation>();

	}
	
	private void fetch() {
		DBCollection table = db.getCollection("order");
		
		BasicDBObject wherePlaced = new BasicDBObject();
		wherePlaced.put("orderStatus", "PLACED");
		
		DBCursor cursor = table.find(wherePlaced);
		
		while (cursor.hasNext()) {
			DBObject value = cursor.next();
			
			BasicDBObject location = (BasicDBObject) value.get("location");
			
			locations.add(new GPSLocation(location.getDouble("lat"), location.getDouble("lng"), value.get("_id").toString()));
		}
	}
	
	public void optimize() {
		
		GPSLocation start = new GPSLocation(40.730012, -74.055236, null);
		
		GPSLocation current = start;
		
		while (locations.size() > 0 ) {
			int nextIndex = 0;
			double min = getDistance(current, locations.get(0));
			for (int i = 1; i < locations.size(); i++) {
				double dist = getDistance(current, locations.get(i));
				if (dist < min) {
					min = dist;
					nextIndex = i;
				}
			}
			
			sortedLocations.add(locations.get(nextIndex));
			current = locations.get(nextIndex);
			locations.remove(nextIndex);		
		}		
	}
	
	public void updateOrderSequence(){
		DBCollection table = db.getCollection("order");
		
		int i = 1;
		for (GPSLocation gpsLocation : sortedLocations) {
			
			BasicDBObject newDocument = new BasicDBObject();
			newDocument.append("$set", new BasicDBObject().append("sequence", i++));

			BasicDBObject searchQuery = new BasicDBObject().append("_id", new ObjectId(gpsLocation.orderId) );

			table.update(searchQuery, newDocument);
		}
		
	}
	
	private double getDistance(GPSLocation x, GPSLocation y) {
		return Math.sqrt( Math.pow(Math.abs(y.lat) - Math.abs(x.lat), 2) +  Math.pow(Math.abs(y.lon) - Math.abs(x.lon), 2) );
	}
	
	public static void main(String[] args) {
		TravellingDeliveryMan deliveryMan = new TravellingDeliveryMan();
		deliveryMan.fetch();
		deliveryMan.optimize();
		deliveryMan.updateOrderSequence();
	}
	
	public class GPSLocation{
		public double lat;
		public double lon;
		public String orderId;
		
		public GPSLocation(double la, double lo, String oid) {
			lat = la;
			lon = lo;
			orderId = oid;
		}
		
		@Override
		public String toString() {
			return "lat,lng: " + lat + ","+ lon + " ~ oid: " + orderId;
		}
	}
}
