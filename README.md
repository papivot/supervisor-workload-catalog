# vSphere Supervisor Cluster — Workload Catalog (VCF 9.1)

An interactive web app that catalogues every workload running in a **vSphere Supervisor cluster**, organized by namespace, with an intelligent 2-sentence role summary per workload derived from pod names, container logs, and VMware/CAPI domain knowledge.

## What this catalog covers

The catalog documents **57 workloads across 20 namespaces** on a VCF 9.1 Supervisor cluster (cluster ID `cbfe7cc4-c40f-4f39-afdb-e2a5e556e806`).

### Namespaces included

| Namespace | Workloads | Purpose |
|---|---|---|
| `kube-system` | 14 | Core Kubernetes control plane + WCP-specific static pods and daemonsets |
| `svc-tkg-5i513` | 17 | Full CAPI/CAPV/TKG stack for provisioning and managing VKS guest clusters |
| `vmware-system-appplatform-operator-system` | 5 | Carvel kapp/secretgen controllers + app-platform lifecycle governance |
| `vmware-system-cert-manager` | 3 | TLS certificate lifecycle management for all Supervisor components |
| `vmware-system-csi` | 2 | vSphere CSI driver (controller + webhook) for PersistentVolume management |
| `vmware-system-pinniped` | 3 | Pinniped OIDC federation (Supervisor + Concierge + cert-agent) |
| `vmware-system-vmop` | 2 | VM Operator — core runtime for creating/managing VMs from Kubernetes objects |
| `vmware-system-monitoring` | 3 | Telegraf node/cluster metrics agents + observability webhook operator |
| `svc-velero-d7ad3` | 2 | Velero vSphere operator + CBT webhook for backup/restore |
| `vmware-system-netop` | 1 | Network operator for NSX-T/VDS NetworkInterface CRD reconciliation |
| `vmware-system-nsop` | 1 | Namespace operator enforcing Supervisor namespace admission policies |
| `vmware-system-zoneop` | 1 | Zone operator tracking vSphere resource pool capacity per topology zone |
| `vmware-system-flb` | 1 | Floating Load Balancer controller for VIP/gateway programming |
| `vmware-system-imageregistry` | 1 | Content Library CDC syncer for VM image inventory |
| `vmware-system-kubeimage` | 1 | Pod image tracking controller |
| `vmware-system-mobility-operator` | 1 | vMotion-aware workload mobility operator |
| `vmware-system-logging` | 1 | Fluent Bit log forwarder daemonset |
| `svc-cci-ns-m2m0g` | 2 | CCI namespace management plugin + proxy for vCenter UI |
| `svc-tmc-c9` | 1 | TMC agent installer (recurring job) |
| `kube-state-metrics-e5aff` | 1 | Prometheus metrics exporter for CAPI/Kubernetes object state |

### Role categories

Each workload is tagged with one of: **Controller**, **Webhook**, **Proxy**, **Plugin Server**, **Metrics**, **Logging**, **Storage**, **Auth**, **Networking**, **Packaging**, **DNS**, or **Runtime**.

### Features

- Namespace pill filter — drill into any single namespace or view all at once
- Dark / light mode toggle (top-right corner)
- Color-coded role badges and workload kind indicators
- Striped, scrollable tables with sticky headers

## Getting started

See [HOWTO.md](HOWTO.md) for build, deployment, and local development instructions.
