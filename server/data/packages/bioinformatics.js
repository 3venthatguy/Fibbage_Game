/**
 * Bioinformatics Question Package
 *
 * Contains trivia questions about bioinformatics, computational biology, and related fields.
 * Add your bioinformatics questions here!
 */

module.exports = {
  id: 'bioinformatics',
  name: 'Bioinformatics',
  description: 'Questions about bioinformatics, computational biology, and related fields',
  icon: '🧬',
  questions: [
    // Example questions - replace with your own!
    {
        question: "In the central dogma of molecular biology, genetic information flows from DNA to RNA to ________.",
        answer: "PROTEIN",
        explanation: "This framework describes transcription and translation, where DNA is transcribed into RNA and RNA is translated into amino acids. It's a clean pipeline on paper—real cells immediately add exceptions, footnotes, and passive-aggressive regulation."
    },
    {
        question: "In Michaelis-Menten enzyme kinetics, reaction velocity approaches a maximum value when the enzyme becomes ________ with substrate.",
        answer: "SATURATED",
        explanation: "At high substrate concentrations, all enzyme active sites are occupied and the reaction rate reaches Vmax. Adding more substrate doesn't help—your enzyme is already doing overtime without healthcare."
    },
    {
        question: "In population genetics, the Hardy-Weinberg equilibrium predicts constant allele frequencies in the absence of evolutionary ________.",
        answer: "FORCES",
        explanation: "The model assumes no mutation, migration, selection, drift, or nonrandom mating. It's a useful baseline that exists exclusively in theory and possibly nowhere else in the universe."
    },
    {
        question: "In DNA sequencing, reads are aligned to a reference genome using algorithms optimized for speed and ________ tolerance.",
        answer: "ERROR",
        explanation: "Aligners like BWA and Bowtie allow mismatches and gaps to account for sequencing errors and biological variation. Without this flexibility, your genome would look wrong simply for existing."
    },
    {
        question: "In RNA-seq analysis, expression levels are often normalized using methods such as TPM or ________ to account for library size.",
        answer: "FPKM",
        explanation: "Normalization adjusts for sequencing depth and gene length, enabling meaningful comparisons across samples. Otherwise, the gene with the loudest sequencing machine wins every argument."
    },
    {
        question: "In phylogenetics, evolutionary relationships are inferred by minimizing changes or maximizing likelihood under a specified ________ model.",
        answer: "SUBSTITUTION",
        explanation: "These models describe how nucleotides or amino acids change over time, accounting for unequal mutation rates. Evolution apparently has favorite letters."
    },
    {
        question: "In genome-wide association studies, stringent significance thresholds are required to correct for multiple hypothesis ________.",
        answer: "TESTING",
        explanation: "With millions of variants tested simultaneously, p-values are adjusted to control false discoveries. Otherwise, everything looks genetically important, including your coffee preference."
    },
    {
        question: "In bioinformatics, de novo genome assembly reconstructs sequences from short reads without using a ________ genome.",
        answer: "REFERENCE",
        explanation: "Assemblers rely on overlap or de Bruijn graphs to piece together genomes from fragments. It's like reconstructing a book from shredded sentences while blindfolded."
    },
    {
        question: "In systems biology, gene regulatory networks model interactions between genes, transcription factors, and ________ pathways.",
        answer: "SIGNALING",
        explanation: "These networks integrate expression data and biochemical interactions to understand cellular responses. Cells communicate constantly, yet still make baffling decisions."
    },
    {
        question: "In evolutionary biology, genetic drift refers to random changes in allele frequencies driven primarily by population ________.",
        answer: "SIZE",
        explanation: "Drift is strongest in small populations, where chance events can dominate selection. Evolution occasionally rolls dice instead of optimizing."
    },
    {
        question: "In protein structure prediction, accuracy improved dramatically with the application of deep ________ learning models.",
        answer: "NEURAL",
        explanation: "Models like AlphaFold learned from massive structural databases to predict folding with near-experimental accuracy. Proteins complained that humans finally cracked their code."
    },
    {
        question: "In sequence alignment, the scoring matrix reflects biological assumptions about mutation ________ between amino acids.",
        answer: "PROBABILITIES",
        explanation: "Matrices such as BLOSUM and PAM quantify how frequently amino acids substitute over evolutionary time. Some amino acids are social, others refuse to mingle."
    },
    {
        question: "In ecology, the logistic growth equation introduces a carrying ________ that limits population expansion.",
        answer: "CAPACITY",
        explanation: "Unlike exponential growth, the logistic model accounts for resource constraints, causing growth to slow as populations increase. Even bacteria eventually hit rent prices."
    },
    {
        question: "In transcriptomics, alternative splicing allows a single gene to produce multiple protein ________.",
        answer: "ISOFORMS",
        explanation: "Different exon combinations expand proteomic diversity without increasing gene count. Genes discovered productivity hacks before humans did."
    },
    {
        question: "In metagenomics, sequencing environmental samples reveals microbial communities without the need for laboratory ________.",
        answer: "CULTIVATION",
        explanation: "Most microbes cannot be grown in the lab, making sequencing essential for studying real ecosystems. Nature politely declined our petri dishes."
    },
    {
        question: "In Bayesian phylogenetics, posterior probabilities combine prior assumptions with observed sequence ________.",
        answer: "DATA",
        explanation: "This framework quantifies uncertainty in tree estimation rather than producing a single best guess. Evolutionary history comes with confidence intervals—emotionally healthy."
    },
    {
        question: "In gene editing, CRISPR-Cas9 introduces double-strand breaks repaired by cellular ________ mechanisms.",
        answer: "REPAIR",
        explanation: "Cells fix breaks via non-homologous end joining or homology-directed repair, enabling targeted edits. Precision biology, powered by controlled cellular panic."
    },
    {
        question: "In bioinformatics pipelines, reproducibility depends critically on version control, metadata, and computational ________.",
        answer: "ENVIRONMENTS",
        explanation: "Differences in software versions or dependencies can change results entirely. Biology is messy enough without your code freelancing."
    },
    {
        question: "In molecular evolution, the ratio of nonsynonymous to synonymous substitutions is used to detect natural ________.",
        answer: "SELECTION",
        explanation: "A dN/dS ratio above one suggests positive selection, while values below one indicate purifying selection. Mutations get judged harshly by statistics."
    },
    {
        question: "In single-cell sequencing, high technical variability requires explicit modeling of dropout events and ________ effects.",
        answer: "NOISE",
        explanation: "Low RNA capture efficiency leads to zeros that reflect measurement limits rather than true absence. The cell spoke quietly, the sequencer blinked."
    },
  ]
};
