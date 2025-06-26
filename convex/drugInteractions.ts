import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Add a drug interaction to the database
export const create = mutation({
  args: {
    drug1: v.string(),
    drug2: v.string(),
    severity: v.union(v.literal("minor"), v.literal("moderate"), v.literal("major")),
    description: v.string(),
    mechanism: v.optional(v.string()),
    clinicalEffects: v.optional(v.string()),
    management: v.optional(v.string()),
    source: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Check if interaction already exists (both directions)
    const existing1 = await ctx.db
      .query("drugInteractions")
      .withIndex("by_drug_pair", (q) => q.eq("drug1", args.drug1).eq("drug2", args.drug2))
      .first();

    const existing2 = await ctx.db
      .query("drugInteractions")
      .withIndex("by_drug_pair", (q) => q.eq("drug1", args.drug2).eq("drug2", args.drug1))
      .first();

    if (existing1 || existing2) {
      throw new Error("Drug interaction already exists");
    }

    const interactionId = await ctx.db.insert("drugInteractions", {
      ...args,
      lastUpdated: now,
    });

    return interactionId;
  },
});

// Check for interactions between two drugs
export const checkInteraction = query({
  args: {
    drug1: v.string(),
    drug2: v.string(),
  },
  handler: async (ctx, args) => {
    // Check both directions
    const interaction1 = await ctx.db
      .query("drugInteractions")
      .withIndex("by_drug_pair", (q) => q.eq("drug1", args.drug1).eq("drug2", args.drug2))
      .first();

    const interaction2 = await ctx.db
      .query("drugInteractions")
      .withIndex("by_drug_pair", (q) => q.eq("drug1", args.drug2).eq("drug2", args.drug1))
      .first();

    return interaction1 || interaction2 || null;
  },
});

// Check interactions for a list of drugs
export const checkMultipleInteractions = query({
  args: {
    medications: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const interactions = [];
    const medications = args.medications;

    // Check each pair of medications
    for (let i = 0; i < medications.length; i++) {
      for (let j = i + 1; j < medications.length; j++) {
        const drug1 = medications[i];
        const drug2 = medications[j];

        // Check both directions
        const interaction1 = await ctx.db
          .query("drugInteractions")
          .withIndex("by_drug_pair", (q) => q.eq("drug1", drug1).eq("drug2", drug2))
          .first();

        const interaction2 = await ctx.db
          .query("drugInteractions")
          .withIndex("by_drug_pair", (q) => q.eq("drug1", drug2).eq("drug2", drug1))
          .first();

        const interaction = interaction1 || interaction2;
        if (interaction) {
          interactions.push({
            ...interaction,
            drug1: drug1,
            drug2: drug2,
          });
        }
      }
    }

    return {
      hasInteractions: interactions.length > 0,
      interactions,
      totalChecked: medications.length,
    };
  },
});

// Get all interactions for a specific drug
export const getInteractionsForDrug = query({
  args: { drug: v.string() },
  handler: async (ctx, args) => {
    // Get interactions where the drug is either drug1 or drug2
    const interactions1 = await ctx.db
      .query("drugInteractions")
      .withIndex("by_drug1", (q) => q.eq("drug1", args.drug))
      .collect();

    const interactions2 = await ctx.db
      .query("drugInteractions")
      .withIndex("by_drug2", (q) => q.eq("drug2", args.drug))
      .collect();

    // Combine and deduplicate
    const allInteractions = [...interactions1, ...interactions2];
    const uniqueInteractions = allInteractions.filter((interaction, index, self) =>
      index === self.findIndex(i => i._id === interaction._id)
    );

    return uniqueInteractions;
  },
});

// Seed drug interaction data with common interactions
export const seedInteractionData = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    
    const commonInteractions = [
      {
        drug1: "Warfarin",
        drug2: "Aspirin",
        severity: "major" as const,
        description: "Increased risk of bleeding when warfarin is combined with aspirin",
        mechanism: "Additive anticoagulant effects",
        clinicalEffects: "Increased bleeding risk, bruising, prolonged bleeding time",
        management: "Monitor INR closely, consider alternative antiplatelet therapy",
        source: "FDA",
      },
      {
        drug1: "Metformin",
        drug2: "Contrast Dye",
        severity: "major" as const,
        description: "Risk of lactic acidosis when metformin is used with iodinated contrast",
        mechanism: "Contrast may cause kidney dysfunction, leading to metformin accumulation",
        clinicalEffects: "Lactic acidosis, kidney dysfunction",
        management: "Discontinue metformin 48 hours before and after contrast procedures",
        source: "FDA",
      },
      {
        drug1: "Lisinopril",
        drug2: "Potassium Supplements",
        severity: "moderate" as const,
        description: "ACE inhibitors can increase potassium levels",
        mechanism: "Reduced potassium excretion by kidneys",
        clinicalEffects: "Hyperkalemia, cardiac arrhythmias",
        management: "Monitor serum potassium levels regularly",
        source: "DrugBank",
      },
      {
        drug1: "Simvastatin",
        drug2: "Grapefruit Juice",
        severity: "moderate" as const,
        description: "Grapefruit juice increases simvastatin levels",
        mechanism: "Inhibition of CYP3A4 enzyme",
        clinicalEffects: "Increased risk of muscle toxicity and rhabdomyolysis",
        management: "Avoid grapefruit juice or reduce simvastatin dose",
        source: "FDA",
      },
      {
        drug1: "Digoxin",
        drug2: "Furosemide",
        severity: "moderate" as const,
        description: "Diuretics can increase digoxin toxicity",
        mechanism: "Electrolyte imbalances (hypokalemia) increase digoxin sensitivity",
        clinicalEffects: "Digoxin toxicity, cardiac arrhythmias",
        management: "Monitor digoxin levels and electrolytes",
        source: "DrugBank",
      },
      {
        drug1: "Omeprazole",
        drug2: "Clopidogrel",
        severity: "moderate" as const,
        description: "PPIs may reduce effectiveness of clopidogrel",
        mechanism: "Inhibition of CYP2C19 enzyme needed for clopidogrel activation",
        clinicalEffects: "Reduced antiplatelet effect, increased cardiovascular risk",
        management: "Consider alternative PPI or antiplatelet agent",
        source: "FDA",
      },
      {
        drug1: "Levothyroxine",
        drug2: "Calcium Carbonate",
        severity: "minor" as const,
        description: "Calcium can reduce absorption of levothyroxine",
        mechanism: "Calcium binds to levothyroxine in the gut",
        clinicalEffects: "Reduced thyroid hormone levels",
        management: "Separate administration by at least 4 hours",
        source: "DrugBank",
      },
      {
        drug1: "Acetaminophen",
        drug2: "Alcohol",
        severity: "major" as const,
        description: "Chronic alcohol use increases risk of acetaminophen hepatotoxicity",
        mechanism: "Alcohol induces CYP2E1, producing toxic metabolites",
        clinicalEffects: "Liver damage, hepatotoxicity",
        management: "Limit acetaminophen dose in chronic alcohol users",
        source: "FDA",
      },
    ];

    const interactionIds = [];
    
    for (const interactionData of commonInteractions) {
      // Check if interaction already exists
      const existing = await ctx.db
        .query("drugInteractions")
        .withIndex("by_drug_pair", (q) => 
          q.eq("drug1", interactionData.drug1).eq("drug2", interactionData.drug2)
        )
        .first();

      if (!existing) {
        const interactionId = await ctx.db.insert("drugInteractions", {
          ...interactionData,
          lastUpdated: now,
        });
        interactionIds.push(interactionId);
      }
    }

    return {
      message: `Seeded ${interactionIds.length} drug interactions`,
      interactionIds,
    };
  },
});

// Update drug interaction
export const update = mutation({
  args: {
    interactionId: v.id("drugInteractions"),
    updates: v.object({
      severity: v.optional(v.union(v.literal("minor"), v.literal("moderate"), v.literal("major"))),
      description: v.optional(v.string()),
      mechanism: v.optional(v.string()),
      clinicalEffects: v.optional(v.string()),
      management: v.optional(v.string()),
      source: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    await ctx.db.patch(args.interactionId, {
      ...args.updates,
      lastUpdated: now,
    });

    return args.interactionId;
  },
});

// Get interactions by severity
export const getBySeverity = query({
  args: { 
    severity: v.union(v.literal("minor"), v.literal("moderate"), v.literal("major")),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("drugInteractions")
      .withIndex("by_severity", (q) => q.eq("severity", args.severity))
      .collect();
  },
});

// Search interactions by drug name (partial match)
export const searchByDrugName = query({
  args: { 
    drugName: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    const searchTerm = args.drugName.toLowerCase();
    
    // Get all interactions and filter by drug name
    const allInteractions = await ctx.db.query("drugInteractions").collect();
    
    const matchingInteractions = allInteractions.filter(interaction => 
      interaction.drug1.toLowerCase().includes(searchTerm) ||
      interaction.drug2.toLowerCase().includes(searchTerm)
    ).slice(0, limit);

    return matchingInteractions;
  },
});

// Delete drug interaction
export const remove = mutation({
  args: { interactionId: v.id("drugInteractions") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.interactionId);
    return args.interactionId;
  },
});
