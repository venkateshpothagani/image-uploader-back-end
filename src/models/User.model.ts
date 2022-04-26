import { Schema, model } from 'mongoose';
import User from '../interface/User.interface';

const UserSchema: Schema<User> = new Schema({
	number: { type: String, required: true, unique: true, maxlength: 10, minlength: 10 },
	password: { type: String, required: true, minlength: 8 },
	name: { type: String, minlength: 6, maxlength: 30 },
	timestamp: { type: Schema.Types.Date, required: true },
});

export default model('User', UserSchema);
