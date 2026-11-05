FROM eclipse-temurin:21-jdk
WORKDIR /app

COPY backend/pom.xml ./backend/
COPY backend/src ./backend/src

WORKDIR /app/backend
RUN apt-get update && apt-get install -y maven && mvn clean package -DskipTests

EXPOSE 8080
CMD ["java", "-jar", "target/forge-production-0.1.0.jar"]
