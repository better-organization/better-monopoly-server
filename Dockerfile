# ---- Build stage ----
FROM openjdk:21-jdk-slim AS builder

WORKDIR /usr/src/app

# Copy Gradle wrapper and build files first (for caching deps)
COPY gradlew gradlew
COPY gradle gradle
COPY build.gradle settings.gradle ./

# Make gradlew executable
RUN chmod +x gradlew

# Download dependencies (this will be cached unless build.gradle changes)
RUN ./gradlew dependencies --no-daemon

# Now copy the source code
COPY src ./src

# Build the application
RUN ./gradlew clean bootJar --no-daemon

# ---- Runtime stage ----
FROM openjdk:21-jre-slim AS runtime

WORKDIR /app

# Copy the JAR file from builder stage
COPY --from=builder /usr/src/app/build/libs/*.jar /app/app.jar

# Expose the port your app listens on
EXPOSE 8080

# Run the JAR file
CMD ["java", "-jar", "app.jar"]