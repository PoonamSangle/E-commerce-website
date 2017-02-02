import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.math.BigInteger;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Queue;

public class Apriori {

	HashMap<Integer, String> is = new HashMap<Integer, String>();
	HashMap<String, Integer> si = new HashMap<String, Integer>();

	static int masterIndex;
	static int[][] result;
	
	int NUM_OF_ITEM;
	
	static int itemIndexArr[];
	// CustomerId to itemId
	Map<String, Map<Integer, Boolean>> custItem = new HashMap<String, Map<Integer, Boolean>>();
	
	Map<String, FrequentItem> frequentSet = new HashMap <String, FrequentItem>();
	List<String> customers;
	
	String frequentset = "frequentset2.txt";
	int support = 10;
	
	DBFetcher fetcher = new DBFetcher();
	
	int trainSet = 600;
	
	public Apriori() {
		preProcessing();
	}

	public void preProcessing(){

		int i = 0;
		
		List<String> itemids = fetcher.fetchItems();
		
		itemIndexArr = new int[itemids.size()];
		for (String id : itemids) {
			is.put(i, id);
			si.put(id, i);
			itemIndexArr[i] = i;
			i++;
		}

		customers = fetcher.fetchCustomers();
		Map<String, Map<String, Boolean>> orders = fetcher.fetchOrders();

		custItem = new HashMap<String, Map<Integer, Boolean>>();

		for (String customer : orders.keySet()) {
			Map<String, Boolean> map = orders.get(customer);
			Map<Integer, Boolean> intmap = new HashMap<>();
			for (String item : map.keySet()) {
				if (si.get(item) != null) {
					intmap.put(si.get(item), true);
				}
			}

			if (intmap.size() > 0)
				custItem.put(customer, intmap);
		}

		System.out.println(custItem.size());
	}

	void apriori() throws IOException{

		File file = new File(frequentset);

		// if file doesnt exists, then create it
		if (!file.exists()) {
			file.createNewFile();
		}

		FileWriter fw = new FileWriter(file.getAbsoluteFile());
		BufferedWriter bw = new BufferedWriter(fw);
		
		int r=3;
		int n = itemIndexArr.length;
		
		while ( true ){
			long c = combination(n, r);
			result = new int[(int) c][r];
			masterIndex = 0;
			
			printCombination(itemIndexArr, n, r);
			
			System.out.println("iteration r:"+r);
			
			if (r < 2) {
				break;
			}
			
			for (int i = 0; i < c; i++) {
				
				int supportcounter = 0;
				
				for (int j = 0; j < trainSet ; j++) {
					
					Map<Integer, Boolean> s = custItem.get(customers.get(j));
					if (s == null)
						continue;

					boolean flag = true;
					for (int k = 0; k < result[i].length; k++) {
//						System.out.print("(c:"+j+",s:"+i+",k:"+k+")");
						if ( s.get(result[i][k]) != null) {
						} else {
							flag = false;
							break;
						}
					}
					
					if (flag) {
						supportcounter ++;
//						System.out.println(result[i].toString() + ":" + supportcounter);
					}
				}
				
				if (supportcounter > support) {
					
					FrequentItem frequentItem = frequentSet.get(is.get(result[i][0]));
					
					if (frequentItem == null) {
						frequentItem = new FrequentItem();
					} else if (frequentItem.maxSupport > supportcounter) {
						continue;
					}
						
						frequentItem.itemId = is.get(result[i][0]);
						for (int j = 1; j < result[i].length; j++) {
							frequentItem.siblingItems.add(is.get(result[i][j]));
						}
						
						while(frequentItem.siblingItems.size() > NUM_OF_ITEM)
							frequentItem.siblingItems.remove();
						
						frequentItem.maxSupport = supportcounter;
						frequentSet.put(frequentItem.itemId, frequentItem);
				}
			}
			
			r--;
		}
		
		
		for (FrequentItem item : frequentSet.values()) {
			bw.write(item.toString() + "\n");
		}
		
		bw.close();

		System.out.println("Done");
	}
	
	public double validate(int gr){
		double accuracy = 0;
		long totalCount = 0;
		long correctCount = 0;
		Map<Integer, Boolean> trans = null;
		String firstItemId = null;
		FrequentItem firstItem;
		ArrayList<String> siblings = null;
		int i = 0;
		
		try{
			
		
		for (i = trainSet; i < custItem.size(); i++) {
			trans = custItem.get(customers.get(i));
			
			if (trans == null)
				continue;
			
			Iterator<Integer> iterator = trans.keySet().iterator();
			
			for (int j = 0; j < gr && j < trans.keySet().size(); j++) {
				firstItemId = is.get(iterator.next());
				
				firstItem = frequentSet.get(firstItemId);
				if (firstItem == null)
					continue;
				
				siblings = new ArrayList<>( firstItem.siblingItems);
				
				for (String sibling : siblings) {
					totalCount ++;
					if (trans.get(si.get(sibling)) != null) {
						correctCount ++;
					}
				}
			}
		}
		} catch (Exception e){
			System.out.println(i + " " + trans + " fid:" + firstItemId + " sibli:" + siblings);
			e.printStackTrace();
		}
		
//		System.out.println( correctCount + "/" + totalCount);
		
		return (double)correctCount/totalCount;
	}
	
	long combination(int n, int r){
		return Long.parseLong(factorial(n).divide( factorial(r).multiply(factorial(n - r))).toString());
	}
	
	static BigInteger factorial(int c){
		BigInteger f = BigInteger.valueOf(1);
		for (int i = 2; i <= c; i++) {
			f = f.multiply(BigInteger.valueOf(i));
		}
		return f;
	}
	
	static void combinationUtil(int arr[], int data[], int start,
			int end, int index, int r)
	{
		if (index == r)
		{
			try{
				for (int j=0; j<r; j++)
					result[masterIndex][j] = data[j];
				masterIndex ++ ;
				return;
			} catch (Exception e) {
				e.printStackTrace();
			}
		}

		for (int i=start; i<=end && end-i+1 >= r-index; i++)
		{
			data[index] = arr[i];
			combinationUtil(arr, data, i+1, end, index+1, r);
		}
	}

	static void printCombination(int arr[], int n, int r)
	{
		int data[]=new int[r];

		// Print all combination using temprary array 'data[]'
		combinationUtil(arr, data, 0, n-1, 0, r);
	}
		
	public static void main(String[] args) throws IOException {
		
		if (args.length != 1) {
			System.out.println("Please pass the number of Items");
			System.out.println("Usage: java -jar RecommendedSet.jar <NUM OF RECOMMENDED ITEMS>");
			return;
		}
		
		Apriori apriori = new Apriori();

		apriori.NUM_OF_ITEM = Integer.parseInt(args[0]);
		
		apriori.apriori();
		
		apriori.insertIntoDataBase();
		
		System.out.println("Accuracy: " + apriori.validate(apriori.NUM_OF_ITEM));
		
	}

	private void insertIntoDataBase() {
		
		fetcher.insertFrequestSets(frequentSet);
		
	}

	
}
