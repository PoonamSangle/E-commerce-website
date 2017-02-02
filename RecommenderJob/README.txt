There are two Java scheduled job that need to be executed. As these jobs are written in Java, they need at least JRE 7.

1) Recommender engine
This is the Runnable JAR that has to be provided with the argument # OF RECOMMENDED ITEMS. Following is the command for execution:
java -jar RecommendedSet.jar <NUM OF RECOMMENDED ITEMS>

2) Delivery Optimizer
This is the Runnable JAR that has to be provided with the argument START GPS POINT. Following is the command for execution:
java -jar DeliveryOptimizer.jar <LATITUDE> <LONGITUTE>

