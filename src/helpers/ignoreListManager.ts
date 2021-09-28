export class IgnoreListManager {
    private static _instance: IgnoreListManager
    ignoreEntries: string[] = []
    private constructor() {
        this.init()
    }

    init():void {
        const initialList = [
            '.DS_Store',
            '.circleci',
            '.git',
            '.gitignore',
            '.nvmrc',
            '.nyc_output',
            'node_modules',
            'vendor',
            '__pycache__',
            'node_modules/**/*',
            'vendor',
            '.circleci',
            '.git',
            '.gitignore',
            '.nvmrc',
            '.nyc_output',
            '.tox',
            '*.am',
            '*.bash',
            '*.bat',
            '*.bw',
            '*.cfg',
            '*.class',
            '*.cmake',
            '*.cmake',
            '*.conf',
            '*.coverage',
            '*.cp',
            '*.cpp',
            '*.crt',
            '*.css',
            '*.csv',
            '*.csv',
            '*.data',
            '*.db',
            '*.dox',
            '*.ec',
            '*.ec',
            '*.egg',
            '*.el',
            '*.env',
            '*.erb',
            '*.exe',
            '*.ftl',
            '*.gif',
            '*.gradle',
            '*.gz',
            '*.h',
            '*.html',
            '*.in',
            '*.jade',
            '*.jar*',
            '*.jpeg',
            '*.jpg',
            '*.js',
            '*.less',
            '*.log',
            '*.m4',
            '*.mak*',
            '*.map',
            '*.md',
            '*.o',
            '*.p12',
            '*.pem',
            '*.png',
            '*.pom*',
            '*.profdata',
            '*.proto',
            '*.ps1',
            '*.pth',
            '*.py',
            '*.pyc',
            '*.pyo',
            '*.rb',
            '*.rsp',
            '*.rst',
            '*.ru',
            '*.sbt',
            '*.scss',
            '*.scss',
            '*.serialized',
            '*.sh',
            '*.snapshot',
            '*.sql',
            '*.svg',
            '*.tar.tz',
            '*.template',
            '*.ts',
            '*.whl',
            '*.xcconfig',
            '*.xcoverage.*',
            '*/classycle/report.xml',
            '*codecov.yml',
            '*~',
            '.*coveragerc',
            '.coverage*',
            'coverage-summary.json',
            'createdFiles.lst',
            'fullLocaleNames.lst',
            'include.lst',
            'inputFiles.lst',
            'phpunit-code-coverage.xml',
            'phpunit-coverage.xml',
            'remapInstanbul.coverage*.json',
            'scoverage.measurements.*',
            'test-result-*-codecoverage.json',
            'test_*_coverage.txt',
            'testrunner-coverage*',
          ]
          initialList.reduce((prev, currentValue) => {
              this.ignoreEntries.push(currentValue)
              return prev
          })
    }

    static getInstance(): IgnoreListManager {
        if (!IgnoreListManager._instance) {
           IgnoreListManager._instance = new IgnoreListManager() 
        }
        return IgnoreListManager._instance
    }
}

const self = IgnoreListManager.getInstance()

export function addEntry(entry: string): void {
    
    if (!self.ignoreEntries.includes(entry)) {
        self.ignoreEntries.push(entry)
    }
}

export function getEntries(): string[] {
    return self.ignoreEntries
}

export function getEntryCount(): number {
    return self.ignoreEntries.length
}   

export function resetEntries(): void {
    self.ignoreEntries = []
    self.init()
}
