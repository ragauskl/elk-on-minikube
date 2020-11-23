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
  minikube start --driver hyperv --hyperv-virtual-switch "Minikube Virtual Switch" --memory "16g" --cpus 6 --disk-size "100g"
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

# Helper Cmds

* Dashboard - `minikube dashboard`
* Get 'elastic' default password - `kubectl get secret elasticsearch-es-elastic-user -o go-template='{{.data.elastic | base64decode}}'`
* Get all - `kubectl -n elasticsearch get all`
* Describe pod - `kubectl -n elasticsearch describe pods es-master-dc4c46fb-j4fgn`
* Delete pod - `kubectl -n elasticsearch delete pod es-master-dc4c46fb-j4fgn`
* Get logs - `kubectl -n elasticsearch logs elasticsearch-es-data-0`
* SSH into pod - `kubectl -n elasticsearch exec --stdin --tty es-master-0 -- /bin/bash`

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
* 

# To-do

- [ ] Get API Logs working
- [ ] Elasticsearch backup and cleanup
- [ ] Dashboard for API mem/cpu/scale
- [ ] [Users management](https://www.elastic.co/guide/en/elasticsearch/reference/current/security-api.html#security-user-apis) or [this](https://www.elastic.co/guide/en/cloud-on-k8s/1.2/k8s-users-and-roles.html#k8s_file_realm)
- [ ] Send logs from outside the cluster
- [ ] Change load balancing with [Linkerd](https://linkerd.io/)
- [ ] Figure out why filebeat add_docker_metadata and add_kubernetes_metadata don't add metadata