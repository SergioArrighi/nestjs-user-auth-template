<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  # <p align="center">NestJS User Auth Template </p>
 <p align="center">A Template for NestJS backend with integrated user authentication and role based authorisation.<p>

## Description

This template encapsulates the necessary features to **register** and **authenticate** users leveraging **JWT tokens**. It also enables to configure **authorisation** to published endpoints by user role. 
It is based on **MongoDB** and **Mongoose** driver fostering a "***single model***" approach with reduced usage of DTOs.
The REST API is available in a local SwaggerUI instance.

## Getting started
### MongoDB
To run the app a MongoDB database is required.
It can be installed locally or on the cloud at [MongoDB Atlas](https://www.mongodb.com/atlas/database).
Once available, the following operations need to be done by hand:

 - Create a new database
 - Create a new collection in the database called **users**
 - Add the first admin modifying the following example document:
```
{
	"_id":"2751a4c3-8d38-4858-ae36-a088acc55830",
	"roles":["admin"],
	"description":"admin",
	"surname":"admin",
	"name":"admin",
	"password":"$2b$11$zmN5hIWDTaJj9ipG28phleYtDVmRlk8ay0k/mwK7JoYuANXUEkrwy",
	"email":"admin@admin.com",
	"createdAt":{"$date":{"$numberLong":"1643103795055"}},
	"updatedAt":{"$date":{"$numberLong":"1643103795055"}},
	"active":"yes"
}
```

> **NOTE**: the example password is the hashed version of '**admin**' thus to login with the default user the credentials are: 
> **admin@admin.com**
> **admin**

### Installation
```bash
$ pnpm install
```

### Running the app

```bash
# development
$ pnpm run start
# watch mode
$ pnpm run start:dev
# production mode
$ pnpm run start:prod
```

## Test

```bash
# unit tests
$ pnpm run test
# e2e tests (not yet implemented)
$ pnpm run test:e2e
# test coverage
$ pnpm run test:cov
```
### Environment
|Name|Description  |
|--|--|
| APP_BE_PORT | The port on which the application will listen |
| APP_AUTH_SECRET | The secret phrase used by the JWT service
| APP_SALT | The rounds used for password hashing
| APP_API_KEY | The API key for robotic authentication
| APP_DB_URI | MongoDB connection string

## Roles
For the time being, the roles are harcoded in an enum (*/src/user/role/role.enum.ts*).

- **Admin**
- **User**
- **Robot**

### Robotic activities
The 'X-API-Key' header can be associated to the request for robotic activity using the key contained in environmental variable **APP_API_KEY**.
The system will associate this requests to an user with role '***Robot***'

> TODO: study and implement an actual key management system
## SwaggerUI

Once the app is started, a SwaggerUI instance is deployed at address http://localhost:3000/api.
It exposes all endpoints and models.

### Authenticating with JWT token
To obtain a JWT token, send a request to **/auth/signin**.
The token will be found in the response along with the user info.
```
{ 
	"user": { 
		"roles": [ "admin" ],
		"description": "admin", 
		"surname": "admin", 
		"name": "admin", 
		"email": "admin@admin.com", 
		"createdAt": "2022-01-25T09:43:15.055Z", 
		"updatedAt": "2022-01-25T09:43:15.055Z", 
		"active": "yes", 
		"id": "2751a4c3-8d38-4858-ae36-a088acc55830" 
	}, 
	"accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyNzUxYTRjMy04ZDM4LTQ4NTgtYWUzNi1hMDg4YWNjNTU4MzAiLCJlbWFpbCI6ImFkbWluQGFkbWluLmNvbSIsInJvbGVzIjpbImFkbWluIl0sImlhdCI6MTcwNTc1OTIyOCwiZXhwIjoxNzA1NzYyODI4fQ.frBziEHZr1oHrsLhoYzQbO6wlPCFf2QxcK6bUdsOsyU" 
}
```
Once the token is obtained:
- Copy the **JWT token**
- Click on the **green 'Authorize' button** in the top right corner
- Paste the token in the '***Bearer***' textbox

### Authenticating with API key
To authenticate for robotic activities by using an API key:

- Set and environmental variable ***APP_API_KEY***
- Copy its value
- Click on the  **green ‘Authorize’ button**  in the top right corner
- Paste in the '***X-API-key***' textbox

## Single model applications
The author defines a single model application as an **application which uses as less DTOs as possible**.
The objects that will be persisted in the database are only defined by their Mongoose schemas and the variations needed for the application/presentation layer are implemented using [Mongoose Virtuals](https://mongoosejs.com/docs/tutorials/virtuals.html).
This is ideal for solo or startup ventures as it minimises the amount of code required and centralises the data validation/transformation.

### User schema
This approach is exemplified in the '***User***' schema (*/src/user/schemas/user.schema.ts*).

    export  type  UserDocument  =  User  &  Document;
	
	@Schema({
		timestamps:  true,
		versionKey:  false,
		id:  true,
	})
	export  class  User {
		constructor(partial?:  Partial<User>) {
			if (partial) Object.assign(this, partial);
		}
	
		@IsOptional()
		@IsUUID()
		@Prop({ type: Object, default: uuidv4, required:  false })
		@Exclude({ toPlainOnly:  true })
		_id?:  object;

		@ApiPropertyOptional({ type: String, format:  'uuid' })
		@IsOptional()
		@IsUUID()
		id?:  string;
		
		@ApiProperty()
		@IsEmail()
		@Prop({ unique:  true, required:  true })
		email:  string;

		@ApiPropertyOptional()
		@IsOptional()
		@Prop({ required:  false })
		@Exclude({ toPlainOnly:  true })
		password:  string;
		
		@ApiProperty()
		@MaxLength(100)
		@IsAscii()
		@Prop({ required:  true })
		name:  string;
		
		...
	  
		@ApiPropertyOptional({ enum: Role, enumName:  'Role', isArray:  true })
		@IsOptional()
		@IsArray()
		@Prop({ default: [Role.User] })
		roles:  Role[];

		@ApiPropertyOptional({ enum: Active, enumName:  'Active' })
		@IsOptional()
		@IsEnum(Active)
		@Prop({ required:  false, default:  Active.No })
		active:  Active;
	}

	const  UserSchema  =  SchemaFactory.createForClass(User);
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	const  mongooseLeanVirtuals  =  require('mongoose-lean-virtuals');
	UserSchema.plugin(mongooseLeanVirtuals);
	export  {  UserSchema  };
	
	export  class  UpdateUser  extends  PartialType(User) {}

This type takes care of a lot of things:

 - Inclusion of the virtual '***id***' field
 ```id:  true```
 - Swagger definition of the fields
```@ApiPropertyOptional({ type: String, format:  'uuid' }) ```
- Data validation with **class-validator**
```@IsEmail() | @MaxLength(100)```
- Data transformation with **class-transformer**
```@Exclude({ toPlainOnly:  true })```
- Mongoose model definition
```@Prop({ required:  false, default:  Active.No })```

Finally it creates the schema enabling the necessary plugin and exports a partial version of the schema itself for update operations.

### Reifying objects
MongoDB queries return instances of '***Document***'.

> For this approach to work, all the **entities returned by the database need to be converted to their schema class**. 
> This is necessary to enable data validation and transformation.

An example from the user service:

    async  create(user:  User):  Promise<User> {
		const  createdUser  =  new  this.userModel(user);
		await  createdUser.save();
		return  new  User(createdUser.toObject({ virtuals:  true }));
	}
The function '***toObject***' of the Mongoose document is used to return an instance of '***User***'.
