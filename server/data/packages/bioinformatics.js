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
        question: "In the central dogma of molecular biology, genetic information flows from DNA to RNA to _____.",
        answer: "PROTEIN",
        explanation: "This framework describes transcription and translation, where DNA is transcribed into RNA and RNA is translated into amino acids. It's a clean pipeline on paper—real cells immediately add exceptions, footnotes, and passive-aggressive regulation."
    },
    {
        question: "In Michaelis-Menten enzyme kinetics, reaction velocity approaches a maximum value when the enzyme becomes _____ with substrate.",
        answer: "SATURATED",
        explanation: "At high substrate concentrations, all enzyme active sites are occupied and the reaction rate reaches Vmax. Adding more substrate doesn't help—your enzyme is already doing overtime without healthcare."
    },
    {
        question: "In population genetics, the Hardy-Weinberg equilibrium predicts constant allele frequencies in the absence of evolutionary _____.",
        answer: "FORCES",
        explanation: "The model assumes no mutation, migration, selection, drift, or nonrandom mating. It's a useful baseline that exists exclusively in theory and possibly nowhere else in the universe."
    },
    {
        question: "In DNA sequencing, reads are aligned to a reference genome using algorithms optimized for speed and _____ tolerance.",
        answer: "ERROR",
        explanation: "Aligners like BWA and Bowtie allow mismatches and gaps to account for sequencing errors and biological variation. Without this flexibility, your genome would look wrong simply for existing."
    },
    {
        question: "In RNA-seq analysis, expression levels are often normalized using methods such as TPM or _____ to account for library size.",
        answer: "FPKM",
        explanation: "Normalization adjusts for sequencing depth and gene length, enabling meaningful comparisons across samples. Otherwise, the gene with the loudest sequencing machine wins every argument."
    },
    {
        question: "In phylogenetics, evolutionary relationships are inferred by minimizing changes or maximizing likelihood under a specified _____ model.",
        answer: "SUBSTITUTION",
        explanation: "These models describe how nucleotides or amino acids change over time, accounting for unequal mutation rates. Evolution apparently has favorite letters."
    },
    {
        question: "In genome-wide association studies, stringent significance thresholds are required to correct for multiple hypothesis _____.",
        answer: "TESTING",
        explanation: "With millions of variants tested simultaneously, p-values are adjusted to control false discoveries. Otherwise, everything looks genetically important, including your coffee preference."
    },
    {
        question: "In bioinformatics, de novo genome assembly reconstructs sequences from short reads without using a _____ genome.",
        answer: "REFERENCE",
        explanation: "Assemblers rely on overlap or de Bruijn graphs to piece together genomes from fragments. It's like reconstructing a book from shredded sentences while blindfolded."
    },
    {
        question: "In systems biology, gene regulatory networks model interactions between genes, transcription factors, and _____ pathways.",
        answer: "SIGNALING",
        explanation: "These networks integrate expression data and biochemical interactions to understand cellular responses. Cells communicate constantly, yet still make baffling decisions."
    },
    {
        question: "In evolutionary biology, genetic drift refers to random changes in allele frequencies driven primarily by population _____.",
        answer: "SIZE",
        explanation: "Drift is strongest in small populations, where chance events can dominate selection. Evolution occasionally rolls dice instead of optimizing."
    },
    {
        question: "In protein structure prediction, accuracy improved dramatically with the application of deep _____ learning models.",
        answer: "NEURAL",
        explanation: "Models like AlphaFold learned from massive structural databases to predict folding with near-experimental accuracy. Proteins complained that humans finally cracked their code."
    },
    {
        question: "In sequence alignment, the scoring matrix reflects biological assumptions about mutation _____ between amino acids.",
        answer: "PROBABILITIES",
        explanation: "Matrices such as BLOSUM and PAM quantify how frequently amino acids substitute over evolutionary time. Some amino acids are social, others refuse to mingle."
    },
    {
        question: "In ecology, the logistic growth equation introduces a carrying _____ that limits population expansion.",
        answer: "CAPACITY",
        explanation: "Unlike exponential growth, the logistic model accounts for resource constraints, causing growth to slow as populations increase. Even bacteria eventually hit rent prices."
    },
    {
        question: "In transcriptomics, alternative splicing allows a single gene to produce multiple protein _____.",
        answer: "ISOFORMS",
        explanation: "Different exon combinations expand proteomic diversity without increasing gene count. Genes discovered productivity hacks before humans did."
    },
    {
        question: "In metagenomics, sequencing environmental samples reveals microbial communities without the need for laboratory _____.",
        answer: "CULTIVATION",
        explanation: "Most microbes cannot be grown in the lab, making sequencing essential for studying real ecosystems. Nature politely declined our petri dishes."
    },
    {
        question: "In Bayesian phylogenetics, posterior probabilities combine prior assumptions with observed sequence _____.",
        answer: "DATA",
        explanation: "This framework quantifies uncertainty in tree estimation rather than producing a single best guess. Evolutionary history comes with confidence intervals—emotionally healthy."
    },
    {
        question: "In gene editing, CRISPR-_____ introduces double-strand breaks repaired by cellular repair mechanisms.",
        answer: "CAS9",
        explanation: "Cells fix breaks via non-homologous end joining or homology-directed repair, enabling targeted edits. Precision biology, powered by controlled cellular panic."
    },
    {
        question: "In bioinformatics pipelines, reproducibility depends critically on version control, metadata, and computational _____.",
        answer: "ENVIRONMENTS",
        explanation: "Differences in software versions or dependencies can change results entirely. Biology is messy enough without your code freelancing."
    },
    {
        question: "In molecular evolution, the ratio of nonsynonymous to synonymous substitutions is used to detect _____.",
        answer: "NATURAL SELECTION",
        explanation: "A dN/dS ratio above one suggests positive selection, while values below one indicate purifying selection. Mutations get judged harshly by statistics."
    },
    {
        question: "In single-cell sequencing, high technical variability requires explicit modeling of dropout events and _____ effects.",
        answer: "NOISE",
        explanation: "Low RNA capture efficiency leads to zeros that reflect measurement limits rather than true absence. The cell spoke quietly, the sequencer blinked."
    },
    {
        question: "In epigenetics, DNA methylation typically occurs at cytosine bases within _____ dinucleotides.",
        answer: "CG",
        explanation: "Methylation at CpG sites regulates gene expression without altering the DNA sequence. Cells use chemical post-it notes to remember which genes to ignore."
    },
    {
        question: "In structural biology, X-ray crystallography determines atomic structures by analyzing diffraction patterns from protein _____.",
        answer: "CRYSTALS",
        explanation: "Proteins are crystallized and bombarded with X-rays; the resulting patterns reveal electron densities. It's like taking a shadow selfie of molecules."
    },
    {
        question: "In comparative genomics, synteny refers to the conserved order of genes on chromosomes between different _____.",
        answer: "SPECIES",
        explanation: "Syntenic blocks indicate shared ancestry and evolutionary rearrangements. Even genomes appreciate a good family resemblance."
    },
    {
        question: "In genome assembly, De Bruijn Graphs are used to reconstruct a sequence from short reads by breaking them into overlapping strings of length $k$, known as _____.",
        answer: "K-MERS",
        explanation: "Instead of comparing every read to every other read (which is computationally expensive), assembly algorithms break reads into $k$-mers. The graph represents these $k$-mers as nodes or edges, and the genome is reconstructed by finding a path through the graph that visits these sequences."
    },
    {
        question: "The Needleman-Wunsch algorithm, a fundamental tool for global sequence alignment, relies on a computational technique called _____.",
        answer: "DYNAMIC PROGRAMMING",
        explanation: "Dynamic programming breaks the alignment problem into smaller sub-problems, storing the results in a scoring matrix. This ensures that the optimal global alignment is found by tracing back through the matrix from the bottom-right to the top-left corner."
    },
    {
        question: "The BLAST (Basic Local Alignment Search Tool) algorithm uses a _____ approach to find regions of local similarity between sequences rather than searching for an exact match.",
        answer: "HEURISTIC",
        explanation: "Because an exhaustive search of massive databases like GenBank would be too slow, BLAST uses heuristics to find 'seeds' (short matches) and then extends them. This trades a small amount of sensitivity for a massive increase in speed."
    },
    {
        question: "In phylogenetics, Maximum _____ is a method used to find the tree topology that requires the fewest number of evolutionary changes (mutations) to explain the observed data.",
        answer: "PARSIMONY",
        explanation: "Based on Occam's Razor, maximum parsimony assumes that the simplest explanation—the one with the fewest mutations—is the most likely. While widely used, it can be misled by 'long-branch attraction' where rapidly evolving lineages appear falsely related."
    },
    {
        question: "The study of the complete set of RNA transcripts produced by the genome under specific circumstances is known as _____.",
        answer: "TRANSCRIPTOMICS",
        explanation: "While the genome is relatively static, the transcriptome is highly dynamic. Using techniques like RNA-Seq, researchers can measure gene expression levels to understand how cells respond to diseases, treatments, or environmental changes."
    },
    {
        question: "A Hidden Markov Model (HMM) is frequently used in bioinformatics for _____, the process of identifying the locations of genes and other functional elements in a DNA sequence.",
        answer: "GENE PREDICTION",
        explanation: "HMMs are probabilistic models that represent transitions between 'hidden' states (like exons, introns, or promoters) based on observed DNA bases. They are particularly effective at identifying patterns in sequences where the underlying structure follows a specific statistical grammar."
    }
  ]
};
