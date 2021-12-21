import td from 'testdouble'
import childProcess from 'child_process'
import * as util from '../../src/helpers/util'


describe('getBashScriptResult()', () => {
    afterEach(() => {
        td.reset()
    })

    it('should run compat mode', async () => {
        const expectedOutput = 'abc\nhjksdabda94#$%!<>==mkdsa='
        const fs = td.replace('fs/promises')
        const tmpFile = td.replace('tmp-promise')
        const runExternalProgram = td.replace(util, 'runExternalProgram')
        const cleanup = td.func();
        td.when(tmpFile.file({mode: 0o700})).thenResolve({
            path: "arbitrarypath",
            cleanup: cleanup
        })
        td.when(fs.readFile(td.matchers.anything())).thenResolve("content");
        td.when(fs.writeFile("arbitrarypath", td.matchers.anything())).thenResolve(null);
        td.when(runExternalProgram("arbitrarypath", ["-d"])).thenReturn("def==!!==!!==&CODECOVDRYRUNSEPARATORabc\nhjksdabda94#$%!<>==mkdsa===!!==!!==&CODECOVDRYRUNSEPARATOR\ndsajdsajbdadubueb4we9bcc");
        const subjectModule = await import('../../src/helpers/compat')
        expect(await subjectModule.getBashScriptResult()).toBe(expectedOutput)
    })

    it('should run compat mode and return nothing on failure', async () => {
        const fs = td.replace('fs/promises')
        const tmpFile = td.replace('tmp-promise')
        const runExternalProgram = td.replace(util, 'runExternalProgram')
        const cleanup = td.func();
        td.when(tmpFile.file({mode: 0o700})).thenResolve({
            path: "arbitrarypath",
            cleanup: cleanup
        })
        td.when(fs.readFile(td.matchers.anything())).thenResolve("content");
        td.when(fs.writeFile("arbitrarypath", td.matchers.anything())).thenResolve(null);
        td.when(runExternalProgram("arbitrarypath", ["-d"])).thenThrow(new Error('Program did not work'));
        const subjectModule = await import('../../src/helpers/compat')
        expect(await subjectModule.getBashScriptResult()).toBe("");
        td.verify(cleanup());
    })

})