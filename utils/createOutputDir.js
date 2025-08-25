import fs from "node:fs"
import os from "node:os"
import path from "node:path"

export async function createDesktopOutputFolder() {
        const desktopDir = path.join(os.homedir(), "Desktop")

        const outputDir = path.join(desktopDir, "stalkermapOUTPUT")

        if (!fs.existsSync(outputDir)) {
                await fs.mkdirSync(outputDir, { recursive: true })
                console.log(`Output directory file created on: ${outputDir}`)
        } else {
                console.log(`Output directory file already exists on: ${outputDir}`)
        }
}

export function getOutputFolder() {
        const desktopDir = path.join(os.homedir(), "Desktop")
        const outputDir = path.join(desktopDir, "stalkermapOUTPUT")

        return outputDir
}
