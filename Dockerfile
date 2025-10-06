FROM maven:3.8.4-openjdk-17 as builder

WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests=true -Dmaven.test.skip=true

FROM openjdk:17-jdk-slim

WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar

EXPOSE ${PORT:-8082}
CMD ["java", "-jar", "-Dspring.profiles.active=prod", "app.jar"]
