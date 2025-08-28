# FROM openjdk:17-jdk-alpine
# WORKDIR /app
# COPY pom.xml .
# COPY src ./src
# RUN ./mvnw package -DskipTests || mvn package -DskipTests
# EXPOSE 8090
# CMD ["java","-jar","target/analytics-service-0.0.1-SNAPSHOT.jar"]
# 
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jdk-jammy
WORKDIR /app
COPY --from=build /app/target/analytics-service-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8090
CMD ["java","-jar","app.jar"]
