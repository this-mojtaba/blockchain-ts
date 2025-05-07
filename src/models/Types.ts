import type { Schema, Types } from 'mongoose';

export type ObjectIDType<T> = Schema.Types.ObjectId | Types.ObjectId | Partial<T>;
