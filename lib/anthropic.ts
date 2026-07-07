// Server-only: caption → structured place extraction via the Claude API.
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { extractionSchema, type Extraction } from "@/lib/validation/instagram";

const EXTRACT_PROMPT = `You extract place information from social media captions about restaurants, cafes, bars, activities, sights, and shops.

Given the caption below, extract:
- place_name: the name of the specific place mentioned (null if no clear place)
- city: the city or area it's in (null if not mentioned)
- category: one of restaurant, cafe, bar, activity, sight, shop, other (null if no clear place)

If several places are mentioned, pick the main one the post is about.

Caption:
`;

export const extractPlaceFromCaption = async (
  caption: string,
): Promise<Extraction | null> => {
  const client = new Anthropic();

  try {
    const response = await client.messages.parse({
      model: "claude-haiku-4-5",
      max_tokens: 1024,
      output_config: { format: zodOutputFormat(extractionSchema) },
      messages: [{ role: "user", content: EXTRACT_PROMPT + caption }],
    });

    return response.parsed_output ?? null;
  } catch {
    return null;
  }
};
