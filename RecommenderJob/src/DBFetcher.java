import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.bson.types.ObjectId;

import com.mongodb.BasicDBObject;
import com.mongodb.DB;
import com.mongodb.DBCollection;
import com.mongodb.DBCursor;
import com.mongodb.DBObject;
import com.mongodb.MongoClient;
import com.mongodb.WriteResult;

import weka.associations.Apriori;
import weka.associations.AssociationRule;
import weka.associations.FPGrowth;
import weka.associations.Item;
import weka.core.Instances;

public class DBFetcher {

	MongoClient mongo;
	DB db ;

	int numRulesValue = 1505;
	int itemGtThan = 15;

	double deltaValue = 0.05;
	double lowerBoundMinSupportValue = 0.01; //1372282
	double minMetricValue = 0.9;
	double upperBoundMinSupportValue = 0.9;

	@SuppressWarnings("deprecation")
	public DBFetcher() {
		mongo = new MongoClient( "localhost" , 27017 );
		db = mongo.getDB("ecommerce");
	}

	public Map<String,Map<String, Boolean>> fetchOrders() {
		DBCollection table = db.getCollection("order");

		List<DBObject> pipeline = new ArrayList<DBObject>();

		BasicDBObject match = new BasicDBObject();

		List<BasicDBObject> matchlist = new ArrayList<BasicDBObject>();
		BasicDBObject whereClause = new BasicDBObject();
		whereClause.put("customerId", new ObjectId("580c11dfc011331f5835571d"));
		whereClause.put("orderStatus", "PLACED");
		matchlist.add(whereClause);

		BasicDBObject andVal = new BasicDBObject();
		andVal.put("$and", matchlist);

		match.put("$match", andVal);

		//		pipeline.add(match);


		BasicDBObject lookupvalue = new BasicDBObject();
		lookupvalue.put("from", "item");
		lookupvalue.put("localField", "itemId");
		lookupvalue.put("foreignField", "_id");
		lookupvalue.put("as", "item");

		BasicDBObject lookup = new BasicDBObject();
		lookup.put("$lookup", lookupvalue);

		//		pipeline.add(lookup);

		//		AggregationOutput cursor = table.aggregate(pipeline);
		//		Iterator<DBObject> i = cursor.results().iterator();
		//		while (i.hasNext()) {
		//			System.out.println(i.next());
		//		}

		Map<String,Map<String, Boolean>> map = new HashMap<String,Map<String, Boolean>>();

		DBCursor cursor = table.find();
		while (cursor.hasNext()) {
			DBObject order = cursor.next();

			Map<String, Boolean> oldM = map.get(order.get("customerId").toString());

			if (oldM == null) {
				oldM = new HashMap<String, Boolean>();
				map.put(order.get("customerId").toString(), oldM);
			}

			oldM.put(order.get("itemId").toString(), new Boolean(true));
		}

		return map;
	}

	public ArrayList<String> fetchCustomers() {
		DBCollection table = db.getCollection("customer_stage");
		ArrayList<String> customers = new ArrayList<>();

		DBCursor cursor = table.find();
		while (cursor.hasNext()) {
			customers.add(cursor.next().get("_id").toString());
		}

		return customers;
	}

	public ArrayList<String> fetchItems() {
		DBCollection table = db.getCollection("item_used");
		ArrayList<String> customers = new ArrayList<>();

		BasicDBObject greater = new BasicDBObject();
		greater.put("$gt", itemGtThan);

		BasicDBObject whereMoreThan = new BasicDBObject();
		whereMoreThan.put("length", greater);

		DBCursor cursor = table.find(whereMoreThan);
		while (cursor.hasNext()) {
			customers.add(cursor.next().get("_id").toString());
		}

		return customers;
	}

	public void writeArff( String fileName,
			ArrayList<String> customers, ArrayList<String> items, Map<String,Map<String, Boolean>> map) throws IOException {

		File file = new File(fileName);

		if (!file.exists()) {
			file.createNewFile();
		}

		FileWriter fw = new FileWriter(file.getAbsoluteFile());
		BufferedWriter bw = new BufferedWriter(fw);

		bw.write("@relation train_transaction\n");

		for (String item : items) {
			bw.write("@attribute " + item + " {TR, FA}\n");
		}

		bw.write("\n@data\n");

		for (String customer : customers) {
			Map<String, Boolean> customerMap = map.get(customer);
			if (customerMap == null) 
				continue;
			String customerLine = "";
			for (String item : items) {
				if (customerMap.get(item) == null) {
					customerLine += "FA ";
				} else {
					customerLine += "TR ";
				}
			}

			if (customerLine.contains("TR"))
				bw.write(customerLine + "\n");
		}

		bw.flush();
		bw.close();

		System.out.println("Arff creation Done");

	}

	private void train(String fileName) {
		Instances data = null;

		try {
			BufferedReader reader = new BufferedReader( new
					FileReader( fileName ) );
			data = new Instances(reader);
			reader.close();
			//			data.setClassIndex(data.numAttributes() - 1);
		}
		catch ( IOException e ) {
			e.printStackTrace();
		}

		String resultapriori = null;

		FPGrowth fpGrowth = new FPGrowth();
		fpGrowth.setDelta(deltaValue);
		fpGrowth.setLowerBoundMinSupport(lowerBoundMinSupportValue);
		fpGrowth.setNumRulesToFind(numRulesValue);
		fpGrowth.setUpperBoundMinSupport(upperBoundMinSupportValue);
		fpGrowth.setMinMetric(minMetricValue);

		try {
			fpGrowth.buildAssociations( data );
		} catch ( Exception e ) {
			e.printStackTrace();
		}

		List<AssociationRule> rules = fpGrowth.getAssociationRules().getRules();

		for (AssociationRule associationRule : rules) {
			boolean flag = true;
			for ( Item premise : associationRule.getPremise()) {
				flag = (flag && premise.getItemValueAsString().equals("TRUE"));

				if (premise.getItemValueAsString().equals("TRUE")) {
					System.out.println(associationRule);
				}

			}

			if (flag) 
				System.out.println(associationRule);
		}

		System.out.println(fpGrowth.toString());

		//		System.out.println(resultapriori); 
		//
		//		Apriori apriori = new Apriori();
		//		apriori.setDelta(deltaValue);
		//		apriori.setLowerBoundMinSupport(lowerBoundMinSupportValue);
		//		apriori.setNumRules(numRulesValue);
		//		apriori.setUpperBoundMinSupport(upperBoundMinSupportValue);
		//		apriori.setMinMetric(minMetricValue);
		//		
		//		try {
		//			apriori.buildAssociations( data );
		//		} catch ( Exception e ) {
		//			e.printStackTrace();
		//		}
		//		
		//		List<AssociationRule> rules = apriori.getAssociationRules().getRules();
		//		
		//		for (AssociationRule associationRule : rules) {
		//			for ( Item premise : associationRule.getPremise()) {
		//				System.out.print(premise.getAttribute().name() + " ~ ");
		//			}
		//			
		//			System.out.println(associationRule.getConsequence().iterator().next());
		//			
		//		}
		//
		//		System.out.println(apriori.toString()); 
	}

	public static void main(String[] args) {
		DBFetcher fetcher = new DBFetcher();
//		String fileName = "train4.arff";
//		try {
//			fetcher.writeArff(fileName, fetcher.fetchCustomers(), fetcher.fetchItems(), fetcher.fetchOrders());
//			fetcher.train(fileName);
//		} catch (IOException e) {
//			e.printStackTrace();
//		}
		
		fetcher.insertItemDescription();
	}

	public void insertFrequestSets(Map<String, FrequentItem> frequentSet) {

		DBCollection table = db.getCollection("frequentsets");
		
		table.remove(new BasicDBObject());
		
		for (FrequentItem frequentItem : frequentSet.values()) {

			BasicDBObject object = new BasicDBObject();
			object.put("itemid", frequentItem.itemId);
			object.put("maxsupport", frequentItem.maxSupport);
			object.put("siblings", frequentItem.siblingItems);

			table.insert(object);
		}

	}

	public void insertItemDescription() {
		
		DBCollection table = db.getCollection("item");

		BufferedReader br = null;

		try {

			String sCurrentLine;

			br = new BufferedReader(new FileReader("C:/Users/prath/Downloads/itemSet.csv"));

			String bufferedLine = "";
			
			while ((sCurrentLine = br.readLine()) != null) {

				String itemAtt[] = sCurrentLine.split("\\|");
				
				if (itemAtt.length != 4) {
					bufferedLine += sCurrentLine;
					continue;
				} else if (bufferedLine.trim() != "") {
					sCurrentLine = bufferedLine;
					bufferedLine = "";
				}
				
				BasicDBObject where = new BasicDBObject();
				where.put("name", itemAtt[0]);

				BasicDBObject att = new BasicDBObject();
				att.put("description", itemAtt[1]);
				att.put("image1", itemAtt[2]);
				att.put("image2", itemAtt[3]);

				BasicDBObject set = new BasicDBObject();
				set.put("$set", att);
				
				
				WriteResult result = table.update(where, set);
				System.out.println(result.toString());
			}

		} catch (IOException e) {
			e.printStackTrace();
		} finally {
			try {
				if (br != null)br.close();
			} catch (IOException ex) {
				ex.printStackTrace();
			}
		}

	}
}
