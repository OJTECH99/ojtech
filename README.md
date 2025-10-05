# Table of Contents
- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [Full-stack Applications](#full-stack-applications)
  - [E-commerce (shopping cart)](#e-commerce-shopping-cart)
    - [Server side implementations](#server-side-implementations)
    - [Client side implementations](#client-side-implementations)
  - [Blog/CMS](#blogcms)
    - [Server side implementations](#server-side-implementations-1)
    - [Client side](#client-side)
      - [The next come are](#the-next-come-are)
  - [Simple CRUD(Create, Read, Update, Delete)](#simple-crudcreate-read-update-delete)
    - [Server side implementations](#server-side-implementations-2)
    - [Client side implementations](#client-side-implementations-1)
      - [The next come are](#the-next-come-are-1)
  - [CRUD + Pagination](#crud--pagination)
    - [Server side implementations](#server-side-implementations-3)
      - [The next come are](#the-next-come-are-2)
    - [Client side implementations](#client-side-implementations-2)
      - [The next come are](#the-next-come-are-3)
- [Social media links](#social-media-links)
- [Commands used to build the project](#commands-used-to-build-the-project)
- [Follow me](#follow-me)
    
# Introduction
An API sample showing how to create a basic Rest API and implement the CRUD operations
using Spring Security OAuth2 with JWT. First you have to obtain a JWT, you can go either to /oauth/token
or to /auth/login, providing client_username:client_password form for http basic authentication as well as post body with username and
password.
Example: POST client1:password@localhost:8080/auth/login
With client1:password as the client credentials. And {"username": "admin": "password":"password"} in the post Body.
For more details and other examples look at the postman_collection.json file attached with this repo

# What you will learn:
- Spring Boot
- Spring Data
- Spring Security
- Spring Security OAuth2 + JWT
- Hql
- Pagination
- Sorting
- Full CRUD
- Customizing Jackson JSON responses and strategies.
- H2 integration
- Seeding data with Faker
- Organizing applications


# Full-stack Applications
## Simple Crud
### Server side implementations
- [Python Django + Rest Framework](https://github.com/melardev/DjangoRestFrameworkCrud)
- [Python Django](https://github.com/melardev/DjanogApiCrud)
- [Python Flask](https://github.com/melardev/FlaskApiCrud)
- [Asp.Net Core](https://github.com/melardev/AspNetCoreApiCrud)
- [Asp.Net Core + MediatR](https://github.com/melardev/AspNetCoreApiCrudMediatR)
- [Asp.Net Core + NHibernate](https://github.com/melardev/.NetCoreApiNHibernateCrud)
- [Asp.Net Core + ADO.Net](https://github.com/melardev/.NetCoreApiADO.NetCrud)
- [Asp.Net Core + Dapper](https://github.com/melardev/.NetCoreApiDapperCrud)
- [Asp.Net Web Api 2](https://github.com/melardev/AspNetWebApiCrud)
- [Asp.Net Web Api 2 + NHibernate](https://github.com/melardev/.NetWebApiNHibernateCrud)
- [Asp.Net Web Api 2 + ADO.Net](https://github.com/melardev/.NetWebApiADO.NetCrud)
- [Asp.Net Web Api 2 + Autofac](https://github.com/melardev/.NetWebApiAutofac)
- [Asp.Net Web Api 2 + Dapper](https://github.com/melardev/.NetWebApiDapperCrud)
- [Laravel](https://github.com/melardev/LaravelApiCrud)
- [Ruby On Rails](https://github.com/melardev/RailsApiCrud)
- [Ruby On Rails + JBuilder](https://github.com/melardev/RailsApiJBuilderCrud)
- [Spring Boot + Spring Data JPA](https://github.com/melardev/SpringBootApiJpaCrud)
- [Spring Boot + Spring Data MonoDb](https://github.com/melardev/JavaSpringBootApiMongoCrud)
- [Spring Boot + Reactive Spring Data MonoDb + Basic Auth](https://github.com/melardev/JavaSpringBootRxApiRxMongoRxHttpBasicCrud)
- [Kotlin Spring Boot + Reactive Spring Data MonoDb + Basic Auth](https://github.com/melardev/KotlinSpringBootRxApiRxMongoRxHttpBasicCrud)
- [Kotlin Spring Boot + Spring Data MonoDb](https://github.com/melardev/KotlinSpringBootApiMongoCrud)
- [Kotlin Spring Boot + Spring Data JPA](https://github.com/melardev/KotlinSpringBootApiJpaCrud)
- [Spring Boot + JAX-RS(Jersey) + Spring Data JPA](https://github.com/melardev/SpringBootApiJerseySpringDataCrud)
- [Spring Boot Reactive + MongoDB Reactive](https://github.com/melardev/SpringBootApiReactiveMongoCrud)
- [Kotlin Spring Boot Reactive + MongoDB Reactive](https://github.com/melardev/KotlinSpringBootRxApiRxMongoCrud)
- [Java Spring Boot Web Reactive + Spring Data](https://github.com/melardev/JavaSpringBootApiRxHybridCrud)
- [Kotlin Spring Boot Web Reactive + Spring Data](https://github.com/melardev/KotlinSpringBootApiRxHybridCrud)
- [Go + GORM](https://github.com/melardev/GoGormApiCrud)
- [Go + GinGonic + GORM](https://github.com/melardev/GoGinGonicApiGormCrud)
- [Go + Gorilla + GORM](https://github.com/melardev/GoMuxGormApiCrud)
- [Go + Beego(Web and ORM)](https://github.com/melardev/GoBeegoApiCrud)
- [Go + Beego + GORM](https://github.com/melardev/GoBeegoGormApiCrud)
- [Express.JS + Sequelize ORM](https://github.com/melardev/ExpressSequelizeApiCrud)
- [Express.JS + BookShelf ORM](https://github.com/melardev/ExpressBookshelfApiCrud)
- [Express.JS + Mongoose](https://github.com/melardev/ExpressMongooseApiCrud)

#### Microservices
- [Java Spring Boot Zuul + Rest](https://github.com/melardev/JavaSpringBootZuulRestApiCrud)
- [Kotlin Spring Boot Zuul + Rest](https://github.com/melardev/KotlinSpringBootZuulRestApiCrud)
- [Java Spring Cloud Eureka + Gateway + EurekaClient Proxy + Rest](https://github.com/melardev/Java_SpringCloud_Eureka_Gateway_EurekaProxy_RestCrud)
- [Java Spring Cloud Eureka + Gateway + LoadBalancedRest Proxy + Rest](https://github.com/melardev/Java_SpringCloud_Eureka_Gateway_LBRestProxy_RestCrud)
- [Java Spring Cloud Eureka + Gateway + Cloud Stream RabbitMQ + Admin + Rest](https://github.com/melardev/Java_SpringCloud_Eureka_Gateway_CloudStreamRabbitMQ_Admin_RestCrud)
- [Java Spring Cloud Eureka + Gateway + Config + Rest Swagger](https://github.com/melardev/Java_SpringCloud_Eureka_Gateway_Config_RestSwaggerCrud)
- [Java Spring Cloud Eureka + Gateway + Admin + Cloud Stream RabbitMQ + RxProxy + RxRest](https://github.com/melardev/Java_SpringCloud_Eureka_Gateway_Admin_CloudStreamRabbitMQ_RxProxy_RxRestCrud)
- [Java Spring Cloud Eureka + Gateway + Webflux + RxMongoDB + Rx Proxy with WebClient](https://github.com/melardev/Java_SpringCloud_Eureka_Gateway_RxWeb_RxMongoDb_RxProxy)
- [Java Spring Cloud Eureka + Zuul + Config + Kafka + Rest](https://github.com/melardev/Java_SpringCloud_Eureka_Zuul_Config_Kafka_RestCrud)
- [Java Spring Cloud Eureka + Zuul + Config + Hystrix + Turbine + Feign + Rest](https://github.com/melardev/Java_SpringCloud_Eureka_Zuul_Config_Hystrix_Turbine_Feign_RestCrud)
- [Java Spring Cloud Eureka + Zuul + Feign + Sleuth + Zipkin + Rest](https://github.com/melardev/Java_SpringCloud_Eureka_Zuul_Feign_Sleuth_Zipkin_RestCrud)
- [Java Spring Cloud Eureka + Zuul + Admin + Rest](https://github.com/melardev/Java_SpringCloud_Eureka_Zuul_Admin_RestCrud)
- [Java Spring Cloud Eureka + Gateway + Config + Cloud Bus RabbitMQ + Rest](https://github.com/melardev/Java_SpringCloud_Eureka_Gateway_Config_CloudBusRabbitMQ_RestCrud)
- [Java Spring Cloud Eureka + Zuul + Rest + LoadBalancer Proxy](https://github.com/melardev/Java_SpringCloud_Eureka_Zuul_LoadBalancerProxy_RestCrud)
- [Java Spring Cloud Eureka + Config Server + Zuul + Kafka + Discovery Client Proxy + Rest](https://github.com/melardev/Java_SpringCloud_Eureka_Zuul_Config_Kafka_ProxyDiscovery_RestCrud)

### Client side implementations
- [React](https://github.com/melardev/ReactCrudAsync)
- [React + Redux](https://github.com/melardev/ReactReduxAsyncCrud)
- [Angular](https://github.com/melardev/AngularApiCrud)
- [Vue](https://github.com/melardev/VueAsyncCrud)
- [Vue + Vuex](https://github.com/melardev/VueVuexAsyncCrud)

#### The next come are
- Angular NgRx-Store
- Angular + Material
- React + Material
- React + Redux + Material
- Vue + Material
- Vue + Vuex + Material
- Ember
- Vanilla javascript

## Crud + Pagination
### Server side implementations
- [AspNet Core](https://github.com/melardev/AspNetCoreApiPaginatedCrud)
- [Asp.Net Core + NHibernate](https://github.com/melardev/.NetCoreApiNHibernateCrudPagination)
- [Asp.Net Core + MediatR](https://github.com/melardev/AspNetCoreApiPaginatedCrudMediatR)
- [Asp.Net Core + ADO.Net](https://github.com/melardev/.NetCoreApiADO.NetCrudPagination)
- [Asp.Net Core + Dapper](https://github.com/melardev/.NetCoreApiDapperCrudPagignation)
- [Asp.Net Web Api 2](https://github.com/melardev/WebApiPaginatedAsyncCrud)
- [Asp.Net Web Api 2 + NHibernate](https://github.com/melardev/.NetWebApiNHibernateCrudPagination)
- [Asp.Net Web Api 2 + ADO.Net](https://github.com/melardev/.NetWebApiADO.NetCrudPagination)
- [Asp.Net Web Api 2 + Autofac](https://github.com/melardev/.NetWebApiAutofacPagination)
- [Asp.Net Web Api 2 + Dapper](https://github.com/melardev/.NetWebApiDapperCrudPagination)
- [Spring Boot + Spring Data + Jersey](https://github.com/melardev/SpringBootJerseyApiPaginatedCrud)
- [Spring Boot + Spring Data](https://github.com/melardev/SpringBootApiJpaPaginatedCrud)
- [Spring Boot + Spring Data MonoDb](https://github.com/melardev/JavaSpringBootApiMongoCrudPagination)
- [Kotlin Spring Boot + Spring Data MonoDb](https://github.com/melardev/KotlinSpringBootApiMongoCrudPagination)
- [Spring Boot Reactive + Spring Data Reactive](https://github.com/melardev/ApiCrudReactiveMongo)
- [Java Spring Boot Web Reactive + Spring Data](https://github.com/melardev/JavaSpringBootApiRxHybridCrudPagination)
- [Kotlin Spring Boot Reactive + MongoDB Reactive](https://github.com/melardev/KotlinSpringBootRxApiRxMongoCrudPagination)
- [Kotlin Spring Boot Web Reactive + Spring Data](https://github.com/melardev/KotlinSpringBootApiRxHybridCrudPagination)
- [Spring Boot + Reactive Spring Data MonoDb + Basic Auth](https://github.com/melardev/JavaSpringBootRxApiRxMongoRxHttpBasicCrudPagination)
- [Kotlin Spring Boot + Reactive Spring Data MonoDb + Basic Auth](https://github.com/melardev/KotlinSpringBootRxApiRxMongoRxHttpBasicCrudPagination)
- [Go + GORM](https://github.com/melardev/GoGormApiCrudPagination)
- [Go + Gin Gonic + GORM](https://github.com/melardev/GoGinGonicApiPaginatedCrud)
- [Go + Gorilla + GORM](https://github.com/melardev/GoMuxGormApiCrudPagination)
- [Go + Beego(Web and ORM)](https://github.com/melardev/GoBeegoApiCrudPagination)
- [Go + Beego(Web) + GORM)](https://github.com/melardev/GoBeegoGormApiCrudPagination)
- [Laravel](https://github.com/melardev/LaravelApiPaginatedCrud)
- [Rails + JBuilder](https://github.com/melardev/RailsJBuilderApiPaginatedCrud)
- [Rails](https://github.com/melardev/RailsApiPaginatedCrud)
- [NodeJs Express + Sequelize](https://github.com/melardev/ExpressSequelizeApiPaginatedCrud)
- [NodeJs Express + Bookshelf](https://github.com/melardev/ExpressBookshelfApiPaginatedCrud)
- [NodeJs Express + Mongoose](https://github.com/melardev/ExpressApiMongoosePaginatedCrud)
- [Python Django](https://github.com/melardev/DjangoApiCrudPaginated)
- [Python Django + Rest Framework](https://github.com/melardev/DjangoRestFrameworkPaginatedCrud)
- [Python Flask](https://github.com/melardev/FlaskApiPaginatedCrud)


#### MicroServices
- [Java Spring Boot Zuul + Rest](https://github.com/melardev/JavaSpringBootZuulRestApiPaginatedCrud)
- [Kotlin Spring Boot Zuul + Rest](https://github.com/melardev/KotlinSpringBootZuulRestApiPaginatedCrud)

#### The next come are
- NodeJs Express + Knex
- Flask + Flask-Restful
- Laravel + Fractal
- Laravel + ApiResources
- Go with Mux
- AspNet Web Api 2
- Jersey
- Elixir

### Client side implementations
- [Angular](https://github.com/melardev/AngularPaginatedAsyncCrud)
- [React-Redux](https://github.com/melardev/ReactReduxPaginatedAsyncCrud)
- [React](https://github.com/melardev/ReactAsyncPaginatedCrud)
- [Vue + Vuex](https://github.com/melardev/VueVuexPaginatedAsyncCrud)
- [Vue](https://github.com/melardev/VuePaginatedAsyncCrud)


#### The next come are
- Angular NgRx-Store
- Angular + Material
- React + Material
- React + Redux + Material
- Vue + Material
- Vue + Vuex + Material
- Ember
- Vanilla javascript


## Auth Jwt + Crud
### Server side implementations
- [Spring Boot](https://github.com/melardev/JavaSpringBootJwtCrudPagination)
- [Spring Boot + OAuth with JWT](https://github.com/melardev/JavaSpringBootOAuth2JwtCrud)

## Auth Jwt + Crud + Pagination
### Server side implementations
- [Spring Boot](https://github.com/melardev/JavaSpringBootJwtCrudPagination)
- [Spring Boot + OAuth with JWT](https://github.com/melardev/JavaSpringBootOAuth2JwtCrudPagination)

### Client side implementations


## E-commerce
### Server side implementations
- [Spring Boot + Spring Data Hibernate](https://github.com/melardev/SBootApiEcomMVCHibernate)
- [Spring Boot + JAX-RS Jersey + Spring Data Hibernate](https://github.com/melardev/SpringBootEcommerceApiJersey)
- [Node Js + Sequelize](https://github.com/melardev/ApiEcomSequelizeExpress)
- [Node Js + Bookshelf](https://github.com/melardev/ApiEcomBookshelfExpress)
- [Node Js + Mongoose](https://github.com/melardev/ApiEcomMongooseExpress)
- [Python Django](https://github.com/melardev/DjangoRestShopApy)
- [Flask](https://github.com/melardev/FlaskApiEcommerce)
- [Golang go gonic](https://github.com/melardev/api_shop_gonic)
- [Ruby on Rails](https://github.com/melardev/RailsApiEcommerce)
- [AspNet Core](https://github.com/melardev/ApiAspCoreEcommerce)
- [Laravel](https://github.com/melardev/ApiEcommerceLaravel)

The next to come are:
- Spring Boot + Spring Data Hibernate + Kotlin
- Spring Boot + Jax-RS Jersey + Hibernate + Kotlin
- Spring Boot + mybatis
- Spring Boot + mybatis + Kotlin
- Asp.Net Web Api v2
- Elixir
- Golang + Beego
- Golang + Iris
- Golang + Echo
- Golang + Mux
- Golang + Revel
- Golang + Kit
- Flask + Flask-Restful
- AspNetCore + NHibernate
- AspNetCore + Dapper

### Client side implementations
This client side E-commerce application is also implemented using other client side technologies:
- [React Redux](https://github.com/melardev/ReactReduxEcommerceRestApi)
- [React](https://github.com/melardev/ReactEcommerceRestApi)
- [Vue](https://github.com/melardev/VueEcommerceRestApi)
- [Vue + Vuex](https://github.com/melardev/VueVuexEcommerceRestApi)
- [Angular](https://github.com/melardev/AngularEcommerceRestApi)

## Blog/CMS
### Server side implementations
### Client side
#### The next come are
- Angular NgRx-Store
- Angular + Material
- React + Material
- React + Redux + Material
- Vue + Material
- Vue + Vuex + Material
- Ember

# Social media links
- [Youtube Channel](https://youtube.com/melardev) I publish videos mainly on programming
- [Blog](http://melardev.com) Sometimes I publish the source code there before Github
- [Twitter](https://twitter.com/@melardev) I share tips on programming
- [Instagram](https://instagram.com/melar_dev) I share from time to time nice banners

# OJTech API - Spring Boot with JWT Authentication

A comprehensive Spring Boot API for the OJTech job matching platform. This API provides user authentication, profile management, job posting and application features.

## Features

- **User Authentication**: JWT-based with role support (Student, Employer, Admin)
- **Profile Management**: Create and update profiles for both students and employers
- **File Upload**: CV and company logo uploads with Cloudinary support
- **Job Management**: Post, search, and apply for jobs
- **Application Tracking**: Track and update job application status

## Technology Stack

- **Framework**: Spring Boot 3.x
- **Security**: Spring Security with JWT
- **Database**: H2 (Development), PostgreSQL (Production)
- **ORM**: Spring Data JPA
- **File Storage**: Cloudinary integration (with local fallback)
- **Documentation**: OpenAPI/Swagger
- **Testing**: JUnit 5, Spring Test

## Project Structure

```
com.melardev.spring.jwtoauth
├── config                 # Configuration classes
├── controller             # API endpoint controllers
├── dao                    # Data access objects (redundant with repositories)
├── dtos                   # Data Transfer Objects
│   ├── requests           # Request bodies
│   └── responses          # Response bodies
├── entities               # Database entities
├── exceptions             # Custom exceptions
├── repositories           # Spring Data JPA repositories
├── security               # Security configuration
│   ├── jwt                # JWT implementation
│   └── services           # UserDetails implementations
├── seeds                  # Database seeders
└── service                # Business logic services
```

## API Endpoints

### Authentication

- `POST /api/auth/login`: Authenticate user and get JWT token
- `POST /api/auth/register`: Register a new user
- `GET /api/auth/me`: Get current authenticated user

### Profile Management

- `GET /api/profile/me`: Get current user profile
- `POST /api/profile/create`: Create initial profile
- `POST /api/profile/update`: Update basic profile information

#### Student Profile

- `GET /api/profile/student/me`: Get student profile
- `POST /api/profile/student/onboarding-v2`: Complete student onboarding
- `POST /api/profile/student/cv`: Upload student CV
- `GET /api/profile/student/cv`: Get student's uploaded CVs
- `POST /api/profile/student/avatar`: Upload profile avatar

#### Employer Profile

- `GET /api/profile/employer/me`: Get employer profile
- `POST /api/profile/employer/onboarding`: Complete employer onboarding
- `POST /api/profile/employer/logo`: Upload company logo

### Job Management

- `GET /api/jobs`: Get all jobs (paginated, filterable)
- `GET /api/jobs/{id}`: Get specific job details
- `POST /api/jobs`: Create new job posting (employers only)
- `PUT /api/jobs/{id}**: Update job posting (employers only)
- `DELETE /api/jobs/{id}**: Delete job posting (employers only)
- `GET /api/jobs/employer`: Get employer's posted jobs
- `GET /api/jobs/search`: Search jobs by title/description

### Job Applications

- `POST /api/applications/apply/{jobId}`: Apply for a job (students only)
- `GET /api/applications`: Get student's applications (students only)
- `GET /api/applications/{id}`: Get specific application details
- `GET /api/applications/job/{jobId}`: Get job applications (employers only)
- `PUT /api/applications/{id}/status`: Update application status (employers only)

## Setup and Installation

### Prerequisites

- Java 17 or higher
- Maven
- PostgreSQL (for production)

### Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/OJTech/ojtech-api.git
   cd ojtech-api
   ```

2. Build the project:
   ```bash
   mvn clean install
   ```

3. Run the application (uses H2 database by default):
   ```bash
   mvn spring-boot:run
   ```

4. Access the API at `http://localhost:8080`
5. Access the Swagger documentation at `http://localhost:8080/swagger-ui.html`

### Configuration

The application can be configured using `application.properties`. Key settings include:

- **Database**: H2 in-memory for development, PostgreSQL for production
- **JWT**: Secret key and token expiration time
- **Cloudinary**: For file storage in production
- **File Upload**: Size limits and local storage location

### Production Setup

For a production environment:

1. Configure PostgreSQL in `application.properties` by uncommenting the PostgreSQL configuration section
2. Set up Cloudinary credentials
3. Use a secure JWT secret key
4. Build a production JAR:
   ```bash
   mvn clean package -Pprod
   ```
5. Run the application:
   ```bash
   java -jar target/ojtech-api.jar
   ```

## Testing

Run the tests with Maven:

```bash
mvn test
```

The test suite includes:
- Unit tests for services and controllers
- Integration tests for API endpoints
- Security tests for authentication

## API Documentation

Interactive API documentation is available via Swagger UI:

- **Development**: http://localhost:8080/swagger-ui.html
- **API Docs**: http://localhost:8080/api-docs

## Security Considerations

This API implements several security measures:

- JWT-based authentication with secure token handling
- Role-based access control
- Password encryption with BCrypt
- Protection against common web vulnerabilities
- Input validation and sanitization

## Error Handling

The API provides consistent error responses across all endpoints:

- HTTP status codes appropriate to the error type
- Detailed error messages
- Validation error details when applicable
- Consistent error response format

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

This project was developed by the OJTech team and is based on Spring Boot best practices.
