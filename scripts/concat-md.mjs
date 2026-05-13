import { readdir, readFile, writeFile, mkdir } from 'fs/promises';
import { join, extname, dirname } from 'path';

// Define input directory and output file paths
const INPUT_DIR = 'src/lib/md/projects';
const OUTPUT_FILE = 'dist/all-projects.md'; // Feel free to change this

async function concatenateMarkdownFiles() {
	try {
		// 1. Read all files in the target directory
		const files = await readdir(INPUT_DIR);

		// 2. Filter for .md files and sort them alphabetically for consistent output
		const mdFiles = files.filter((file) => extname(file).toLowerCase() === '.md').sort();

		if (mdFiles.length === 0) {
			console.log(`No Markdown files found in ${INPUT_DIR}`);
			return;
		}

		console.log(`Found ${mdFiles.length} Markdown files. Concatenating...`);

		let combinedContent = '';

		// 3. Loop through each file, read it, and append it to our string
		for (const file of mdFiles) {
			const filePath = join(INPUT_DIR, file);
			const content = await readFile(filePath, 'utf-8');

			// Add a nice separator and comment to track which file the content came from
			combinedContent += `<!-- ============================================== -->\n`;
			combinedContent += `<!-- File: ${file} -->\n`;
			combinedContent += `<!-- ============================================== -->\n\n`;
			combinedContent += content.trim();
			combinedContent += `\n\n\n`; // Add some breathing room between files
		}

		// 4. Ensure the output directory exists before writing
		const outputDir = dirname(OUTPUT_FILE);
		await mkdir(outputDir, { recursive: true });

		// 5. Write the final concatenated string to the output file
		await writeFile(OUTPUT_FILE, combinedContent.trim(), 'utf-8');

		console.log(`✅ Successfully concatenated into: ${OUTPUT_FILE}`);
	} catch (error) {
		if (error.code === 'ENOENT') {
			console.error(`❌ Error: Could not find directory '${INPUT_DIR}'. Please ensure it exists.`);
		} else {
			console.error('❌ An unexpected error occurred:', error);
		}
	}
}

// Execute the script using top-level await (supported in .mjs)
await concatenateMarkdownFiles();
