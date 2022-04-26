interface User {
	name: string;
	number: string;
	password: string;
	confirmPassword?: string;
	timestamp?: Date;
}

export default User;
