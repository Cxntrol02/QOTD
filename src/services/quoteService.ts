import type { CreateQuoteInput, QuoteEntity, QuoteRepository } from "../repositories/quoteRepository";

export class QuoteService {
  public constructor(private readonly quoteRepository: QuoteRepository) {}

  public async addQuote(input: CreateQuoteInput): Promise<QuoteEntity> {
    const trimmedText = input.text.trim();
    const trimmedAuthor = input.author?.trim();
    if (!trimmedText) {
      throw new Error("Question text cannot be empty.");
    }

    return this.quoteRepository.create({
      text: trimmedText,
      author: trimmedAuthor,
      addedById: input.addedById
    });
  }

  public async getRandomQuote(): Promise<QuoteEntity | null> {
    return this.quoteRepository.getRandom();
  }

  public async getAllQuotes(): Promise<QuoteEntity[]> {
    return this.quoteRepository.listAll();
  }
}
