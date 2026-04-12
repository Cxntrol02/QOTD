export interface QuoteEntity {
  id: number;
  text: string;
  author: string | null;
  addedById: string;
  createdAt: Date;
}

export interface CreateQuoteInput {
  text: string;
  author?: string;
  addedById: string;
}

export interface QuoteRepository {
  create(input: CreateQuoteInput): Promise<QuoteEntity>;
  listAll(): Promise<QuoteEntity[]>;
  getRandom(): Promise<QuoteEntity | null>;
}
