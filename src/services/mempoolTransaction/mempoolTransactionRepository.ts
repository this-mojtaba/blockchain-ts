import type { FilterQuery, UpdateQuery } from 'mongoose';
import { BlockModel, type IBlock } from '../../models/block';
import type { ObjectIDType } from '@models';

class MempoolTransactionRepositoryClass {}

export const MempoolTransactionRepository = new MempoolTransactionRepositoryClass();
