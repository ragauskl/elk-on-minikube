# Requirements 

* [Minikube](https://minikube.sigs.k8s.io/docs/start/)

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

  
  # Test connection
  kubectl run my-shell --rm -i --tty --image ubuntu -- bash
  > apt update && apt install curl -y
  > curl http://elasticsearch-es-http.default:9200/_cluster/health?pretty

  # Should return:
  {
    "cluster_name" : "my-es",
    "status" : "green",
    "timed_out" : false,
    "number_of_nodes" : 8,
    "number_of_data_nodes" : 3,
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
* Get 'elastic' user password
  ```
  PASSWORD=$(kubectl get secret elasticsearch-es-elastic-user -o go-template='{{.data.elastic | base64decode}}')
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

# Helper Cmds

* Dashboard - `minikube dashboard`
* Get all - `kubectl -n elasticsearch get all`
* Describe pod - `kubectl -n elasticsearch describe pods es-master-dc4c46fb-j4fgn`
* Delete pod - `kubectl -n elasticsearch delete pod es-master-dc4c46fb-j4fgn`
* Get logs - `kubectl -n elasticsearch logs elasticsearch-es-data-0`
* SSH into pod - `kubectl -n elasticsearch exec --stdin --tty es-master-0 -- /bin/bash`
