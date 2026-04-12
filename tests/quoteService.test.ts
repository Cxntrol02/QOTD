import { describe, expect, it } from "vitest";
import { QuoteService } from "../src/services/quoteService";
import type {
  CreateQuoteInput,
  QuoteEntity,
  QuoteRepository
} from "../src/repositories/quoteRepository";

class InMemoryQuoteRepository implements QuoteRepository {
  private quotes: QuoteEntity[] = [];
  private sequence = 1;

  public async create(input: CreateQuoteInput): Promise<QuoteEntity> {
    const created: QuoteEntity = {
      id: this.sequence++,
      text: input.text,
      author: input.author ?? null,
      addedById: input.addedById,
      createdAt: new Date()
    };
    this.quotes.push(created);
    return created;
  }

  public async listAll(): Promise<QuoteEntity[]> {
    return [...this.quotes];
  }

  public async getRandom(): Promise<QuoteEntity | null> {
    return this.quotes[0] ?? null;
  }
}

describe("QuoteService", () => {
  it("trims quote text before saving", async () => {
    const service = new QuoteService(new InMemoryQuoteRepository());

    const quote = await service.addQuote({
      text: "  Keep going.  ",
      addedById: "u1"
    });

    expect(quote.text).toBe("Keep going.");
  });

  it("throws when quote text is empty", async () => {
    const service = new QuoteService(new InMemoryQuoteRepository());

    await expect(service.addQuote({ text: "   ", addedById: "u1" })).rejects.toThrow(
      "Quote text cannot be empty."
    );
  });
});
