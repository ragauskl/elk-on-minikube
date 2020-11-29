import Shell from './shell'
import * as path from 'path'

import * as inspector from 'inspector'

// Open inspector from script if argument has been provided, because
// if debugger gets attached before inspector command is called, it does
// no detect that debugger is attached
const debug = /--inspect/.test(process.argv.join(' '))
if (debug) {
  inspector.open(9229, '0.0.0.0', true)
}

const cwd = path.join(__dirname, '../..')
const shell = new Shell(cwd)

; (async () => {
  console.time('Created in')
  await shell.run('minikube delete')
  await shell.run([
    `minikube start`,
    `--driver hyperv`,
    `--hyperv-virtual-switch "Minikube Virtual Switch"`,
    `--memory "16g"`,
    `--cpus 6`,
    `--disk-size "100g"`
  ])

  await shell.run(`kubectl apply -f 1-custom-resource-def.yml`)
  await sleep(1000)

  await shell.run(`kubectl apply -f 2-optional-storage.yml`)
  await sleep(1000)

  await applySet({
    display: 'Elasticsearch',
    expectedPods: 5,
    elasticType: 'elasticsearch',
    yml: '3-es.yml'
  })

  await applySet({
    display: 'Kibana',
    expectedPods: 1,
    elasticType: 'kibana',
    yml: '4-kibana.yml'
  })

  await shell.run(`kubectl apply -f 5-ingress.yml`)

  await applySet({
    display: 'Metricbeat',
    expectedPods: 1,
    elasticType: 'beat',
    beatType: 'metricbeat',
    yml: '6-metric-beat.yml'
  })

  await applySet({
    display: 'Filebeat',
    expectedPods: 1,
    elasticType: 'beat',
    beatType: 'filebeat',
    yml: '7-file-beat.yml'
  })

  await applySet({
    display: 'Heartbeat',
    expectedPods: 1,
    elasticType: 'beat',
    beatType: 'heartbeat',
    yml: '8-heart-beat.yml'
  })

  await applySet({
    display: 'Packetbeat',
    expectedPods: 1,
    elasticType: 'beat',
    beatType: 'packetbeat',
    yml: '9-packet-beat.yml'
  })

  console.timeEnd('Created in')
})()

function sleep (ms: number) {
  return new Promise(res => setTimeout(res, ms))
}

async function applySet (opts: {
  display: string
  elasticType: string
  beatType?: string
  yml: string
  expectedPods: number
}) {
  await shell.run(
    `kubectl apply -f ${opts.yml}`
  )

  let running = 0

  const cmd = (state: string) => [
    `kubectl get pods`,
    `-l common.k8s.elastic.co/type=${opts.elasticType}`,
    opts.beatType ? `-l beat.k8s.elastic.co/name=${opts.beatType}` : '',
    `--field-selector=status.phase=${state}`,
    `--output json | jq -j ".items | length"`
  ]

  let failedWarning: string | undefined
  console.info(`\n${opts.display} Waiting for ${opts.expectedPods} Pods to be in Running state`)
  do {
    running = +await shell.run(cmd('Running'), { stdoutLog: false })

    if (running !== opts.expectedPods) {
      const failed = +await shell.run(cmd('Failed'), { stdoutLog: false })
      if (failed > 0) {
        if (!failedWarning) {
          failedWarning = `\n${opts.display} Pods are failing, please check the logs`
          console.warn(failedWarning)
        }
      } else if (failedWarning) {
        console.info(`\n${opts.display} Pods no longer failing`)
        failedWarning = undefined
      }
      await sleep(5000)
    }
  } while (opts.expectedPods !== running)

  console.info(`\n${opts.display}: OK, ${opts.expectedPods} Pods running`)
}
