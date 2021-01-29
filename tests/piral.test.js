const path = require("path");
const fs = require('fs');
const { toMatchFilesystemSnapshot } = require("jest-fs-snapshot");
const { cleanDir, cleanupForSnapshot, getInitializerOptions, execute, snapshotOptions, sleep } = require("../src/common");

const cliVersion = process.env.CLI_VERSION || "latest";
const bundlerPrefix = !!process.env.BUNDLER ? process.env.BUNDLER + "-" : "";
const pathToBuildDir = path.resolve(process.cwd(), bundlerPrefix + "piral-inst");

jest.setTimeout(300 * 1000); // 300 second timeout
expect.extend({ toMatchFilesystemSnapshot });

describe("piral", () => {
    it("scaffold piral", async () => {

        await cleanDir(pathToBuildDir);

        const info = await execute(`npm init piral-instance@${cliVersion} ` + getInitializerOptions(), {
            cwd: pathToBuildDir,
        });

        await cleanupForSnapshot(pathToBuildDir);

        expect(info.stderr).toBe("");
        expect(pathToBuildDir).toMatchFilesystemSnapshot(undefined, snapshotOptions);
    });

    it("upgrade piral", async () => {

        const pathToPackageJson = path.resolve(`${pathToBuildDir}`, 'package.json');

        let packageJson = require(pathToPackageJson);
        packageJson.dependencies.piral = "0.12.0";
        fs.writeFile(pathToPackageJson, JSON.stringify(packageJson));

        const version = "0.12.4";

        const info = await execute(`npx piral upgrade ${version}`, {
            cwd: pathToBuildDir,
        });

        packageJson = require(pathToPackageJson);
        const versionAfterUpgrade = packageJson.dependencies.piral;

        expect(versionAfterUpgrade).toContain(version);
        expect(info.stderr).toBe("");
        expect(info.stdout).toContain('Piral instance upgraded successfully');
    })
});
