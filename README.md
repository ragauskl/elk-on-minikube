# Setup

* Create cluster (Windows Hyper-V)
  ```sh
  minikube start --driver hyperv --hyperv-virtual-switch "Minikube Virtual Switch" --memory "16g" --cpus 6 --disk-size "100g"
  ```
* Create 3 master node
  ```sh
  kubectl apply -f es-master.yml
  ```
* Create persistent storage and data nodes
  ```sh
  kubectl apply -f es-data.yml
  ```
* Create client nodes
  ```sh
  kubectl apply -f es-client.yml

  # Test connection
  kubectl run my-shell --rm -i --tty --image ubuntu -- bash
  > apt update && apt install curl -y
  > curl http://elasticsearch-client.elasticsearch:9200/_cluster/health?pretty

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
* Expose services to local environment
  ```sh
  kubectl apply -f ingress.yml
  ```
* Access Kibana @ `http://*minikube ip*/app/kibana` 
* Optionally apply auto-scaler
  ```sh
  kubectl apply -f h-scale.yml
  ```
