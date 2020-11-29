# Requirements 

* [Minikube](https://minikube.sigs.k8s.io/docs/start/)
* Administrator privileges when running on Hyper-V (Run VSCode or shell as administrator)
* jq package if you'll be using ./setup script
  * Windows: `chocolatey install jq` 

# Resources

* [Elastic Cloud on Kubernetes](https://www.elastic.co/guide/en/cloud-on-k8s/1.2/k8s-deploy-eck.html)
* [Orchestrating Elastic Stack applications](https://www.elastic.co/guide/en/cloud-on-k8s/1.2/k8s-orchestrating-elastic-stack-applications.html)
* [Common Problems](https://www.elastic.co/guide/en/cloud-on-k8s/1.2/k8s-common-problems.html)
* [Subscriptions](https://www.elastic.co/subscriptions)
* 

# Setup

* Create cluster (Windows Hyper-V)
  ```sh
  minikube start --driver hyperv --hyperv-virtual-switch "Minikube Virtual Switch" --memory "16g" --cpus 6 --disk-size "100g" --mount --mount-string="$HOME/.../ELK/shared-mount:/shared-mount"
  ```

* Install [custom resource definitions](https://download.elastic.co/downloads/eck/1.2.1/all-in-one.yaml) and the operator with its RBAC rules:
  ```sh
  kubectl apply -f 1-custom-resource-def.yml
  ```
* Optionally create StorageClass
  ```sh
  kubectl apply -f 2-optional-storage.yml
  ```
* Create Elasticsearch
  ```sh
  kubectl apply -f 3-es.yml
  ```
* Get 'elastic' user password
  ```sh
  PASSWORD=$(kubectl get secret elasticsearch-es-elastic-user -o go-template='{{.data.elastic | base64decode}}')

  # Test connection with
  kubectl run my-shell --rm -i --tty --image ubuntu -- bash
  > apt update && apt install curl -y
  > curl -u "elastic:$PASSWORD" -k https://elasticsearch-es-http.default:9200/_cluster/health?pretty

  # OR enable port forwarding in separate shell
  kubectl port-forward service/elasticsearch-es-http 9200
  curl -u "elastic:$PASSWORD" -k https://localhost:9200/_cluster/health?pretty

  # Should return:
  {
    "cluster_name" : "elasticsearch",
    "status" : "green",
    "timed_out" : false,
    "number_of_nodes" : 5,
    "number_of_data_nodes" : 2,
    "active_primary_shards" : 0,
    "active_shards" : 0,
    "relocating_shards" : 0,
    "initializing_shards" : 0,
    "unassigned_shards" : 0,
    "delayed_unassigned_shards" : 0,
    "number_of_pending_tasks" : 0,
    "number_of_in_flight_fetch" : 0,
    "task_max_waiting_in_queue_millis" : 0,
    "active_shards_percent_as_number" : 100.0
  }
  ```
* If using backup/restore, you'll need to [register local directory as registry](#register-mock-repository) for elasticsearch to back up to
* Create Kibana
  ```sh
  kubectl apply -f 4-kibana.yml
  ```
* Expose Kibana outside cluster
  ```sh
  minikube addons enable ingress
  kubectl apply -f 5-ingress.yml
  ```
* Access Kibana @ `http://*minikube ip*/app/kibana`
  * Or run `kubectl port-forward service/kibana-kb-http 5601` for access @ `http://localhost:5601/app/kibana`

## Run API in Minikube

> /api/...

* Build api to /api/dist with 'tsc' command
* Run 'minikube docker-env' and follow instructions (Will have to repeat this for every shell that will be used)
* Build docker image for api 'docker build -t elk-api:latest .'
* Apply .kube files in order, deployment.yml has to be applied in same shell as last 2 steps
* Should now be able to access API at **cluster_ip**:3000

## Add Beats

* Deploys Metricbeat as a DaemonSet that monitors the host resource usage (CPU, memory, network, filesystem) and Kubernetes resources (Nodes, Pods, Containers, Volumes)
  ```sh
  kubectl apply -f 6-metric-beat.yml
  ```
* Deploy Filebeat and collect the logs of all containers running in the Kubernetes cluster
  ```sh
  kubectl apply -f 7-file-beat.yml
  ```
* Deploy Heartbeat to monitor uptime of Elasticsearch and mock API
   ```sh
  kubectl apply -f 8-heart-beat.yml
  ```

## Shared File System

For this specific test case, run `minikube start` with parameters `--mount --mount-string="$HOME/.../ELK/shared-mount:/shared-mount"`. Or alternatively mount the directory after 'minikube start' with 'minikube mount $HOME/.../ELK/shared-mount:/shared-mount".

For local setup only ./elk/3-es.yml contains volume mount to directory in minikube
```yml
...
nodeSets:
- ...
  config:
    path.repo:
      -"/shared-mount/es-backup"
podTemplate:
  spec:
    containers:
     - ...
       volumeMounts:
        - mountPath: /shared-mount
          name: host-mount
    volumes:
    - name: host-mount
      hostPath:
        path: /shared-mount
...
```

### Register Mock Repository
Use the PUT snapshot repository API to register the file system repository. Specify the file system’s path in settings.location

```sh
PUT /_snapshot/es_backup
{
  "type": "fs",
  "settings": {
    "location": "/shared-mount/es-backup",
    "compress": true
  }
}
```



> If pods don't have directory /shared-mount make sure directory was correctly mounted to minikube and restart whole cluster or force Rolling Update to restart pods.





# Helper Cmds

* Dashboard - `minikube dashboard`
* SSH into minikube - `minikube ssh`
* Force Rolling Update - `kubectl patch statefulset NAME -p '{"spec":{"updateStrategy":{"type":"RollingUpdate"}}}'`
* Get 'elastic' default password - `kubectl get secret elasticsearch-es-elastic-user -o go-template='{{.data.elastic | base64decode}}'`
* Get all - `kubectl -n elasticsearch get all`
* Describe pod - `kubectl -n elasticsearch describe pods es-master-dc4c46fb-j4fgn`
* Delete pod - `kubectl -n elasticsearch delete pod es-master-dc4c46fb-j4fgn`
* Get logs - `kubectl -n elasticsearch logs elasticsearch-es-data-0`
* SSH into pod - `kubectl -n elasticsearch exec --stdin --tty es-master-0 -- /bin/bash`
* Port forward - `kubectl port-forward service/elasticsearch-es-http 9200`

# Useful Links

* [Filebeat yml](https://www.elastic.co/guide/en/beats/filebeat/master/configuring-howto-filebeat.html)
* [Heartbeat yml](https://www.elastic.co/guide/en/beats/heartbeat/current/configuring-howto-heartbeat.html)
* [Packetbeat yml](https://www.elastic.co/guide/en/beats/packetbeat/current/configuring-howto-packetbeat.html)
* [Common problems](https://www.elastic.co/guide/en/cloud-on-k8s/1.2/k8s-common-problems.html#k8s-common-problems)
* [Version Upgrades](https://www.elastic.co/guide/en/elastic-stack/current/upgrading-elastic-stack.html)

## More...

* [Community beats](https://www.elastic.co/guide/en/beats/libbeat/current/community-beats.html)
  
## When in prod

* [Setup HTTP Certificate](https://www.elastic.co/guide/en/cloud-on-k8s/1.2/k8s-custom-http-certificate.html) ([other link](https://www.elastic.co/guide/en/cloud-on-k8s/1.2/k8s-tls-certificates.html))


# Backup and Restore

## Elasticsearch

Backups are done using [Snapshot API](https://www.elastic.co/guide/en/elasticsearch/reference/current/snapshots-take-snapshot.html). Snapshots can be stored in systems with Repository Plugin which extends Snapshot/Restore functionality. [It can be achieved using popular cloud services like AWS S3, Google Cloud etc.](https://www.elastic.co/guide/en/elasticsearch/plugins/7.10/repository.html) or in a [repository on a shared file system](#shared-file-system).
* [How to Register a Snapshot Repository](https://www.elastic.co/guide/en/elasticsearch/reference/7.10/snapshots-register-repository.html)

Restore can be done to same or different cluster, but the other cluster must be not more than 1 major version higher. Read more about restoring from snapshot in this [link](https://www.elastic.co/guide/en/elasticsearch/reference/current/snapshots-restore-snapshot.html). You also cannot restore snapshots from later Elasticsearch versions into a cluster running an earlier Elasticsearch version.

* Create Snapshot
  ```
  PUT /_snapshot/es_backup/20201129_1626_snapshot?wait_for_completion=true
  ```
* [Setup Snapshot Schedule](https://www.elastic.co/guide/en/elasticsearch/reference/current/getting-started-snapshot-lifecycle-management.html#slm-gs-create-policy)
* Get snapshots list
  ```
  GET /_snapshot/es_backup/_all?pretty
  ```
* Restore from Snapshot
  ```
  POST /_snapshot/es_backup/20201129_1626_snapshot/_restore
  ```

### Logs and Metrics Retention

Elastic Cloud Enterprise automatically curates the logging and metrics indices it collects. By default, metrics indices are kept for one day and logging indices are kept for seven days.

...In progress



# To-do

- [ ] Get API Logs working
- [ ] Dashboard for API mem/cpu/scale
- [ ] [Users management](https://www.elastic.co/guide/en/elasticsearch/reference/current/security-api.html#security-user-apis) or [this](https://www.elastic.co/guide/en/cloud-on-k8s/1.2/k8s-users-and-roles.html#k8s_file_realm)
- [ ] Send logs from outside the cluster
- [ ] Change load balancing with [Linkerd](https://linkerd.io/)
- [ ] Figure out why filebeat add_docker_metadata and add_kubernetes_metadata don't add metadata

