import java.util.LinkedList;
import java.util.Queue;

public class FrequentItem {
		String itemId;
		Queue<String> siblingItems;
		int maxSupport;
		
		public FrequentItem() {
			siblingItems = new LinkedList<>();
		}
		
		@Override
		public String toString() {
			return "[" + itemId + ", [" + siblingItems + "]," + maxSupport
					+ "]";
		}
	}