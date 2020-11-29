import * as shell from 'shelljs'

export default class Shell {
  constructor (private cwd?: string) {}

  // Takes around 10min, most steps can be run at same time,
  // but for sake of debugging one step at a time if something breaks
  // - first wait for one step to complete before moving onto next one
  run = async (cmd: string | string[], options: {
    customError?: Error | null
    stdoutLog?: boolean
  } = {}): Promise<string> => {
    cmd = Array.isArray(cmd) ? cmd.join(' ') : cmd

    if (options.stdoutLog === undefined) options.stdoutLog = true
    if (options.stdoutLog) console.info(`\n# Command: `, `"${cmd}"`)

    try {
      const stdout = await new Promise<string>((res, rej) => {
        shell.exec(cmd as string, {
          silent: !options.stdoutLog,
          cwd: this.cwd
        }, (code, stdout, stderr) => {
          if (code === 0) res(stdout)
          else rej(stderr || `Status: ${code}`)
        })
      })
      return stdout
    } catch (error) {
      console.error('\n', error, '\n')
      if (options.customError !== null) {
        throw options.customError || error
      }
    }
  }
}
