FROM maven:3.9.5-eclipse-temurin-21 as builder

WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests=true -Dmaven.test.skip=true

FROM eclipse-temurin:21-jre-jammy

WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar

# Render uses PORT environment variable
EXPOSE ${PORT:-8080}

# Use exec form and bind to 0.0.0.0 for Render
CMD ["sh", "-c", "java -Dserver.port=${PORT:-8080} -Dspring.profiles.active=prod -jar app.jar"]
