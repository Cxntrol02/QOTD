import type { PrismaClient } from "@prisma/client";
import type { CreateQuoteInput, QuoteEntity, QuoteRepository } from "./quoteRepository";

export class PrismaQuoteRepository implements QuoteRepository {
  public constructor(private readonly prisma: PrismaClient) {}

  public async create(input: CreateQuoteInput): Promise<QuoteEntity> {
    return this.prisma.quote.create({
      data: {
        text: input.text,
        author: input.author,
        addedById: input.addedById
      }
    });
  }

  public async listAll(): Promise<QuoteEntity[]> {
    return this.prisma.quote.findMany({ orderBy: { createdAt: "desc" } });
  }

  public async getRandom(): Promise<QuoteEntity | null> {
    const count = await this.prisma.quote.count();
    if (count === 0) {
      return null;
    }

    const skip = Math.floor(Math.random() * count);
    const [quote] = await this.prisma.quote.findMany({
      take: 1,
      skip,
      orderBy: { id: "asc" }
    });

    return quote ?? null;
  }
}
