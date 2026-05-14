import { expect, test, describe } from "bun:test";
import { checkMessageContent } from "@/lib/adab-guard";

describe("checkMessageContent", () => {
  describe("bad words", () => {
    test("blocks message with explicit kata kasar", () => {
      const result = checkMessageContent("ini bodoh sekali");
      expect(result.passed).toBe(false);
      expect(result.violationCategory).toBe("bad_word");
    });

    test("blocks message with mixed case bad word", () => {
      const result = checkMessageContent("Dia memang GoBLOk");
      expect(result.passed).toBe(false);
      expect(result.violationCategory).toBe("bad_word");
    });

    test("allows clean message", () => {
      const result = checkMessageContent("Assalamualaikum, bagaimana kabar hari ini?");
      expect(result.passed).toBe(true);
    });

    test("allows innocent words that contain bad word substring", () => {
      const result = checkMessageContent("saya suka makan bakso");
      expect(result.passed).toBe(true);
    });

    test("blocks explicit sexual harassment", () => {
      const result = checkMessageContent("kamu itu kontol");
      expect(result.passed).toBe(false);
    });
  });

  describe("appearance talk", () => {
    test("blocks message with physical appearance talk", () => {
      const result = checkMessageContent("kamu cantik sekali");
      expect(result.passed).toBe(false);
      expect(result.violationCategory).toBe("appearance");
    });

    test("blocks message about body talk", () => {
      const result = checkMessageContent("badanmu seksi");
      expect(result.passed).toBe(false);
      expect(result.violationCategory).toBe("appearance");
    });
  });

  describe("dating talk", () => {
    test("blocks message with pacaran language", () => {
      const result = checkMessageContent("apakah kamu mau pacaran?");
      expect(result.passed).toBe(false);
      expect(result.violationCategory).toBe("dating");
    });

    test("blocks message with sayang", () => {
      const result = checkMessageContent("aku sayang kamu");
      expect(result.passed).toBe(false);
      expect(result.violationCategory).toBe("dating");
    });

    test("blocks message about mantan", () => {
      const result = checkMessageContent("ceritain tentang mantanmu");
      expect(result.passed).toBe(false);
      expect(result.violationCategory).toBe("dating");
    });
  });
});
