import { useState } from "react";

type WorkloadKind = "Deployment" | "DaemonSet" | "Static Pod" | "StatefulSet" | "Job";
type RoleCategory =
  | "Controller" | "Webhook" | "Proxy" | "Plugin Server"
  | "Metrics" | "Logging" | "Storage" | "Auth"
  | "Networking" | "Packaging" | "DNS" | "Runtime";

interface Workload {
  name: string;
  kind: WorkloadKind;
  replicas: string;
  role: RoleCategory;
  summary: string;
}

interface NamespaceData {
  ns: string;
  workloads: Workload[];
}

const DATA: NamespaceData[] = [
  {
    ns: "kube-system",
    workloads: [
      { name: "coredns", kind: "Deployment", replicas: "3/3", role: "DNS", summary: "Cluster-internal DNS server that answers A/AAAA/SRV queries for service discovery across the Supervisor. Serves all pods as the default nameserver, resolving cluster.local and external domains." },
      { name: "snapshot-controller", kind: "Deployment", replicas: "3/3", role: "Storage", summary: "Orchestrates the full CSI VolumeSnapshot lifecycle (create/delete/restore) via the Kubernetes external-snapshotter framework. Keeps VolumeSnapshot and VolumeSnapshotContent objects reconciled with the underlying vSphere storage backend." },
      { name: "storage-quota-webhook", kind: "Deployment", replicas: "3/3", role: "Webhook", summary: "Admission webhook that enforces per-namespace vSphere storage policy quotas on PVC create and update requests. Rejects or allows operations based on quota headroom tracked by CNS (Cloud Native Storage)." },
      { name: "cns-storage-quota-extension", kind: "Deployment", replicas: "1/1", role: "Webhook", summary: "Webhook extension that intercepts PVC admission requests to apply CNS-aware quota logic, specifically exempting VirtualMachine-backed PVCs sourced via VM Operator from quota accounting. Bridges the CNS quota system with the VM Operator storage model." },
      { name: "supervisor-authz-service-controller-manager", kind: "Deployment", replicas: "1/1", role: "Auth", summary: "Reconciles VCPrivilegeMapping CRDs to synchronise Kubernetes RBAC role bindings with vCenter privilege assignments on resource objects. Translates group/role bindings into VC-level permission grants, keeping Kubernetes and vCenter authorization in sync." },
      { name: "kube-proxy", kind: "DaemonSet", replicas: "3/3", role: "Networking", summary: "Runs on every node and maintains iptables/ipvs rules to forward traffic destined for Kubernetes Service ClusterIPs and NodePorts to the correct pod endpoints. Implements the core kube-proxy service routing plane." },
      { name: "wcp-authproxy", kind: "DaemonSet", replicas: "3/3", role: "Auth", summary: "Handles WCP (Workload Control Plane) authentication by exchanging client bearer tokens for vCenter SSO HOK/ID tokens via the VC Token Exchange Service. Acts as the auth front-end on each control-plane node between kubectl clients and the Supervisor API server." },
      { name: "docker-registry", kind: "Static Pod", replicas: "3", role: "Runtime", summary: "Runs a local OCI-compatible Docker distribution registry on each control-plane node, serving supervisor service package bundles (Velero, VKS, VKM-SVS, etc.) over HTTP. Provides an air-gap-friendly on-node image pull source for all supervisor service installations." },
      { name: "kubectl-plugin-vsphere", kind: "Static Pod", replicas: "3", role: "Proxy", summary: "Serves the kubectl-vsphere plugin binary download endpoint and runs a wcp-apiserver-proxy sidecar that forwards API requests from the vCenter UI through to the Supervisor Kubernetes API server. Acts as both a plugin distribution server and a local API proxy on each control-plane node." },
      { name: "wcp-fip", kind: "Static Pod", replicas: "3", role: "Networking", summary: "vSphere WCP Floating IP (FIP) manager that programs the virtual IP used as the stable Supervisor API server endpoint across control-plane nodes. Ensures the Supervisor kube-apiserver is always reachable via a single VIP regardless of which node is active." },
      { name: "etcd", kind: "Static Pod", replicas: "3", role: "Runtime", summary: "Distributed key-value store that serves as the sole persistence backend for all Kubernetes API objects on the Supervisor cluster. Runs as a 3-member Raft cluster (one per control-plane node) providing consensus-based, highly available state storage." },
      { name: "kube-apiserver", kind: "Static Pod", replicas: "3", role: "Runtime", summary: "The Supervisor Kubernetes API server that exposes the REST and gRPC API, enforcing authentication, authorisation, and admission control for all requests. Every kubectl, operator, and vCenter UI interaction terminates here before being persisted to etcd." },
      { name: "kube-controller-manager", kind: "Static Pod", replicas: "3", role: "Controller", summary: "Runs all core Kubernetes reconciliation loops (Deployment, ReplicaSet, Node lifecycle, ServiceAccount token rotation, etc.). Continuously drives the cluster toward the declared desired state by watching API objects and taking corrective actions." },
      { name: "kube-scheduler", kind: "Static Pod", replicas: "3", role: "Runtime", summary: "Selects the optimal node for each unscheduled pod using resource availability, affinity rules, and taint/toleration constraints. Writes the binding decision back to the API server so the kubelet on the chosen node can start the pod." },
    ],
  },
  {
    ns: "kube-state-metrics-e5aff",
    workloads: [
      { name: "kube-state-metrics", kind: "Deployment", replicas: "1/1", role: "Metrics", summary: "Watches Kubernetes API objects (Deployments, Machines, Clusters, Pods, etc.) and exposes their raw state as Prometheus-scrapable metrics. Enables external monitoring stacks to alert on CAPI cluster and machine health without writing custom exporters." },
    ],
  },
  {
    ns: "svc-cci-ns-m2m0g",
    workloads: [
      { name: "cci-ns-controller-manager", kind: "Deployment", replicas: "1/1", role: "Proxy", summary: "Backend API proxy that serves Kubernetes API calls initiated by the vCenter CCI (Cloud Consumption Interface) namespace management UI plugin, translating UI requests into Supervisor API calls for namespaces, storage quotas, VM images, and  VKS configurations. Acts as the data-plane bridge between vCenter and the Supervisor API for the CCI namespace plugin." },
      { name: "masterproxy-cci-ns-plugin", kind: "DaemonSet", replicas: "3/3", role: "Plugin Server", summary: "Serves the CCI-NS vCenter UI plugin JSON descriptor (plugin-9.1.0.json) to the WCP masterproxy on each control-plane node so vCenter can register and load the CCI namespace management plugin iframe. Functions as a static file server embedded on control-plane nodes for vCenter plugin discovery." },
    ],
  },
  {
    ns: "svc-tkg-5i513",
    workloads: [
      { name: "capi-controller-manager", kind: "Deployment", replicas: "2/2", role: "Controller", summary: "Core Cluster API (CAPI) controller reconciling Cluster, Machine, MachineSet, and MachineDeployment objects. Drives the full lifecycle (provision, scale, upgrade, delete) of VKS guest Kubernetes clusters." },
      { name: "capi-kubeadm-bootstrap-controller-manager", kind: "Deployment", replicas: "2/2", role: "Controller", summary: "CAPI bootstrap provider that generates KubeadmConfig cloud-init scripts for newly provisioned VMs. Produces the bootstrap data (kubeadm join tokens, certificate info) that initialises kubelet on VKS worker and control-plane nodes." },
      { name: "capi-kubeadm-control-plane-controller-manager", kind: "Deployment", replicas: "2/2", role: "Controller", summary: "CAPI control-plane provider managing KubeadmControlPlane objects for VKS guest clusters. Orchestrates rolling control-plane upgrades, etcd membership, and horizontal scaling of the guest cluster control plane." },
      { name: "capv-controller-manager", kind: "Deployment", replicas: "2/2", role: "Controller", summary: "Cluster API Provider for vSphere (CAPV) that reconciles VSphereCluster and VSphereMachine CRDs by making govmomi API calls to vCenter to create, configure, and delete VMs. Translates abstract CAPI machine intents into concrete vSphere infrastructure operations." },
      { name: "machine-agent-server", kind: "Deployment", replicas: "1/1", role: "Runtime", summary: "HTTP file server distributing the machine-agent binary (/x86/linux/v1alpha1/) to VKS nodes during bootstrap. Newly provisioned nodes download the in-guest agent from this server as one of the first bootstrap steps before joining the cluster." },
      { name: "masterproxy-tkgs-plugin", kind: "DaemonSet", replicas: "3/3", role: "Plugin Server", summary: "Serves the VKS vCenter UI plugin JSON descriptor to the WCP masterproxy on each control-plane node so vCenter can register the Tanzu Kubernetes Grid management plugin tab. Acts as the on-node static file server for VKS plugin discovery and registration." },
      { name: "runtime-extension-controller-manager", kind: "Deployment", replicas: "1/1", role: "Webhook", summary: "CAPI Runtime Extension webhook server handling GeneratePatches lifecycle hooks to resolve and inject the correct TKR (Tanzu Kubernetes Release) version into a cluster's ClusterClass topology at provision and upgrade time. Patches cluster topology variables such as OS image and Kubernetes version based on the resolved TKR." },
      { name: "tanzu-addons-controller-manager", kind: "Deployment", replicas: "1/1", role: "Controller", summary: "Manages the lifecycle of Tanzu add-on packages (Pinniped, CNI plugins, etc.) installed into VKS guest clusters via PackageInstall and AddonInstall CRDs. Reconciles add-on configuration definitions and package install statuses to keep guest-cluster add-ons up to date." },
      { name: "tanzu-auth-controller-manager", kind: "Deployment", replicas: "1/1", role: "Auth", summary: "Cascades Pinniped authentication configuration secrets from the Supervisor to VKS guest clusters so each cluster inherits the Supervisor's OIDC identity provider configuration. Reconciles pinniped-package secrets across cluster namespaces to maintain a consistent auth posture." },
      { name: "tkgs-plugin-server", kind: "Deployment", replicas: "2/2", role: "Plugin Server", summary: "Serves the VKS backend plugin.json API endpoint manifest consumed by the vCenter UI  VKS plugin to discover available API endpoints. Acts as the API discovery file server underpinning the vCenter  VKS management interface." },
      { name: "tkr-conversion-webhook-manager", kind: "Deployment", replicas: "1/1", role: "Webhook", summary: "Webhook server that performs API version conversion for TanzuKubernetesRelease (TKR) objects between storage and hub versions as the CRD evolves. Ensures backward compatibility so older TKR references continue to work across API version upgrades." },
      { name: "tkr-resolver-cluster-webhook-manager", kind: "Deployment", replicas: "1/1", role: "Webhook", summary: "Admission webhook that resolves and injects the correct TKR into a Cluster object when no explicit Kubernetes version is set, constructing a version query and selecting the best matching release. Intercepts cluster creates and updates to guarantee a valid, compatible Kubernetes version is always selected." },
      { name: "tkr-status-controller-manager", kind: "Deployment", replicas: "1/1", role: "Controller", summary: "Watches TanzuKubernetesRelease objects and maintains their availability and compatibility status (e.g. v1.34.2+vmware.2) so operators and webhooks can query which Kubernetes versions are valid for new or upgrading clusters. Maintains the KubernetesRelease inventory consumed by the TKR resolver webhook." },
      { name: "upgrade-compatibility-service", kind: "Deployment", replicas: "1/1", role: "Controller", summary: "Exposes a validation service that checks whether a VKS guest cluster can be upgraded from its current version to a requested target version. Guards against invalid upgrade paths that skip minor versions or violate compatibility constraints." },
      { name: "vmware-system-tkg-controller-manager", kind: "Deployment", replicas: "2/2", role: "Controller", summary: "Primary  VKS Supervisor controller watching Cluster and ClusterClass objects to drive VMware-specific VKS reconciliation including ClusterClass lifecycle and node pool management. Augments core CAPI controllers with VMware-specific logic for cluster operations." },
      { name: "vmware-system-tkg-state-metrics", kind: "Deployment", replicas: "2/2", role: "Metrics", summary: "Exposes VKS-domain Prometheus metrics covering guest cluster state, node pool counts, and CAPI object health for external monitoring pipelines. Complements the generic kube-state-metrics with VKS-specific resource metrics." },
      { name: "vmware-system-tkg-webhook", kind: "Deployment", replicas: "2/2", role: "Webhook", summary: "Validating and mutating admission webhook for VKS Cluster, MachineDeployment, and related CAPI objects enforcing VMware-specific constraints at admission time. Validates failure domain placement, ClusterClass compatibility, and VirtualMachineGroup references before objects are persisted." },
    ],
  },
  {
    ns: "svc-tmc-c9",
    workloads: [
      { name: "tmc-agent-installer", kind: "Job", replicas: "1 (recurring)", role: "Controller", summary: "Short-lived job that installs and reconciles the Tanzu Mission Control (TMC) agent into the svc-tmc-c9 namespace on a scheduled basis. Each run ensures the TMC agent deployment is at the correct version and configuration for the Supervisor's TMC registration." },
    ],
  },
  {
    ns: "svc-velero-d7ad3",
    workloads: [
      { name: "velero-vsphere-operator", kind: "Deployment", replicas: "1/1", role: "Controller", summary: "Operator managing the lifecycle of Velero backup and restore capabilities for vSphere-backed VKS clusters. Watches BackupStorageLocation and related CRDs to configure and reconcile the full Velero data protection stack." },
      { name: "velero-vsphere-operator-webhook", kind: "Deployment", replicas: "3/3", role: "Webhook", summary: "Admission webhook for the Velero vSphere operator that intercepts VM Operator VirtualMachine objects to set Change Block Tracking (CBT) flags required for incremental disk backups. Validates and mutates VM objects to ensure they are in a backup-compatible state before admission." },
    ],
  },
  {
    ns: "vmware-system-appplatform-operator-system",
    workloads: [
      { name: "kapp-controller", kind: "Deployment", replicas: "1/1", role: "Packaging", summary: "Carvel kapp-controller continuously reconciling App and PackageInstall CRDs to deploy and sync Kubernetes application packages across the Supervisor. Drives the lifecycle management of all supervisor services (VKS, Velero, TMC) installed via the VMware app-platform." },
      { name: "secretgen-controller", kind: "Deployment", replicas: "1/1", role: "Packaging", summary: "Carvel secretgen-controller that reconciles SecretTemplate CRDs to generate, cascade, and rotate derived secrets (env-props, credentials) for supervisor service packages. Provides the secret templating and propagation layer underpinning app-platform service installations." },
      { name: "vmware-system-psp-operator-mgr", kind: "Deployment", replicas: "1/1", role: "Storage", summary: "Reconciles storage classes, PVC fake-attach states, and persistence service configurations to keep the Supervisor's storage posture consistent with vSphere storage policy changes. Handles FakeAttach lifecycle for PVCs backing VKS nodes and monitors storage pool watch channels." },
      { name: "vmware-system-appplatform-lifecycle-mgr", kind: "DaemonSet", replicas: "3/3", role: "Packaging", summary: "HTTP authorization server running on each control-plane node that validates first-party bundle signatures and trust before any supervisor service package is installed. Acts as the on-node trust gatekeeper, authorising or rejecting package operations by checking Broadcom-signed manifests." },
      { name: "vmware-system-appplatform-operator-mgr", kind: "StatefulSet", replicas: "1", role: "Webhook", summary: "Primary app-platform operator manager that enforces governance across all supervisor service namespaces (svc-*) via mutating and validating webhooks. Validates namespace and pod admission requests, ensuring only trusted service accounts can create or delete resources within managed namespaces." },
    ],
  },
  {
    ns: "vmware-system-cert-manager",
    workloads: [
      { name: "cert-manager", kind: "Deployment", replicas: "1/1", role: "Auth", summary: "Core cert-manager controller reconciling Certificate, CertificateRequest, and Issuer CRDs to automate TLS certificate issuance and renewal for all Supervisor components. Manages the full certificate lifecycle for webhook servers, internal endpoints, and guest cluster auth services." },
      { name: "cert-manager-cainjector", kind: "Deployment", replicas: "1/1", role: "Auth", summary: "Injects CA bundles from cert-manager Certificate resources into MutatingWebhookConfiguration, ValidatingWebhookConfiguration, and APIService objects automatically. Ensures webhook TLS trust anchors remain current as certificates rotate, preventing webhook failures during cert renewal." },
      { name: "cert-manager-webhook", kind: "Deployment", replicas: "1/1", role: "Webhook", summary: "Admission webhook for cert-manager that validates and mutates Certificate, Issuer, and related resource manifests at submission time. Prevents malformed certificate configurations from being persisted and causing downstream issuance failures." },
    ],
  },
  {
    ns: "vmware-system-csi",
    workloads: [
      { name: "vsphere-csi-controller", kind: "Deployment", replicas: "2/2", role: "Storage", summary: "vSphere CSI driver controller managing PersistentVolume provisioning, attachment, detachment, expansion, and snapshot operations against vSphere datastores. Translates Kubernetes storage requests into CNS (Cloud Native Storage) API calls on vCenter." },
      { name: "vsphere-csi-webhook", kind: "Deployment", replicas: "2/2", role: "Webhook", summary: "Admission webhook for the vSphere CSI driver validating and mutating StorageClass and PersistentVolumeClaim objects to enforce vSphere-specific storage policy constraints. Prevents misconfigured storage resources from reaching the CSI controller and causing failed provisioning." },
    ],
  },
  {
    ns: "vmware-system-flb",
    workloads: [
      { name: "flb-controller", kind: "Deployment", replicas: "1/1", role: "Networking", summary: "Floating Load Balancer controller that reconciles Kubernetes LoadBalancer-type Services and Gateway objects to program VIP and L4 load-balancer rules for VKS clusters. Updates the Service .status.loadBalancer field with allocated IP addresses as gateway state changes." },
    ],
  },
  {
    ns: "vmware-system-imageregistry",
    workloads: [
      { name: "vmware-system-imageregistry-controller-manager", kind: "Deployment", replicas: "2/2", role: "Controller", summary: "Reconciles vSphere Content Library items into ClusterContentLibraryItem and related CRDs, syncing VM image metadata from vCenter into the Supervisor's API surface. Drives periodic polling of the Content Library CDC (Change Data Capture) feed to keep the cluster's available VM image inventory current." },
    ],
  },
  {
    ns: "vmware-system-kubeimage",
    workloads: [
      { name: "image-controller", kind: "Deployment", replicas: "1/1", role: "Controller", summary: "Watches pods across all Supervisor namespaces and reconciles image pull policy and availability state for each pod's container images. Ensures image references used by running and scheduled pods are tracked and kept consistent, including short-lived job pods." },
    ],
  },
  {
    ns: "vmware-system-logging",
    workloads: [
      { name: "fluentbit", kind: "DaemonSet", replicas: "3/3", role: "Logging", summary: "Fluent Bit log collector running on each control-plane node that tails log files from system paths and ships them to a configured external log sink. Provides centralised log forwarding for the Supervisor control-plane node fleet." },
    ],
  },
  {
    ns: "vmware-system-mobility-operator",
    workloads: [
      { name: "vmware-system-mobility-operator-controller-manager", kind: "Deployment", replicas: "2/2", role: "Controller", summary: "Operator managing workload mobility for VMs controlled by the VM Operator, enabling vMotion-aware migration workflows. Runs a webhook server alongside a leader-elected controller to reconcile mobility-related CRDs and coordinate VM migration operations." },
    ],
  },
  {
    ns: "vmware-system-monitoring",
    workloads: [
      { name: "telegraf", kind: "DaemonSet", replicas: "3/3", role: "Metrics", summary: "Per-node Telegraf metrics agent running on each control-plane node, scraping kubelet /metrics and /metrics/cadvisor endpoints and exposing the results as a Prometheus client endpoint. Acts as the node-level metrics collection backbone for the Supervisor monitoring pipeline." },
      { name: "telegraf-deploy", kind: "Deployment", replicas: "1/1", role: "Metrics", summary: "Cluster-level Telegraf deployment aggregating metrics from across the Supervisor and outputting them to a Prometheus client endpoint and file sink. Complements the per-node telegraf DaemonSet with cluster-scoped metric collection." },
      { name: "vmware-system-observability-controller-manager", kind: "Deployment", replicas: "1/1", role: "Webhook", summary: "Validating and mutating webhook operator that gates automated VKS (vSphere Kubernetes Service) monitoring enablement on VKS guest clusters. Intercepts cluster and pod admission requests to determine whether automated monitoring should be injected based on cluster capabilities." },
    ],
  },
  {
    ns: "vmware-system-netop",
    workloads: [
      { name: "vmware-system-netop-controller-manager", kind: "Deployment", replicas: "2/2", role: "Networking", summary: "Network operator reconciling NetworkInterface CRDs to provision and manage virtual network interfaces for VMs and pods in the Supervisor. Bridges Kubernetes network object intents with the underlying NSX-T or VDS networking infrastructure." },
    ],
  },
  {
    ns: "vmware-system-nsop",
    workloads: [
      { name: "vmware-system-nsop-controller-manager", kind: "Deployment", replicas: "2/2", role: "Webhook", summary: "Namespace operator serving mutating and validating webhooks (/supervisor-namespace-mutate and /supervisor-namespace-validate) for all Supervisor Namespace objects. Enforces namespace policies, quota defaults, and annotation rules for every vSphere Supervisor namespace at admission time." },
    ],
  },
  {
    ns: "vmware-system-pinniped",
    workloads: [
      { name: "pinniped-concierge", kind: "Deployment", replicas: "2/2", role: "Auth", summary: "Pinniped Concierge in-cluster authenticator that accepts JWT/OIDC tokens from kubectl clients and exchanges them for Kubernetes impersonation credentials. Acts as the token validation and impersonation proxy, enabling OIDC-authenticated users to access VKS clusters." },
      { name: "pinniped-concierge-kube-cert-agent", kind: "Deployment", replicas: "1/1", role: "Auth", summary: "Runs alongside the Concierge to maintain and periodically rotate the short-lived signing certificate used for generating impersonation credentials. Ensures the Concierge always holds a valid cert so authentication token exchange is uninterrupted." },
      { name: "pinniped-supervisor", kind: "Deployment", replicas: "2/2", role: "Auth", summary: "Pinniped Supervisor OIDC provider that federates external identity providers (vCenter SSO, LDAP) into a standards-compliant OIDC issuer for the Supervisor. Issues FedTokens and ID tokens consumed by the Concierge to authenticate users to VKS guest clusters." },
    ],
  },
  {
    ns: "vmware-system-vmop",
    workloads: [
      { name: "vmware-system-vmop-controller-manager", kind: "Deployment", replicas: "2/2", role: "Controller", summary: "VM Operator controller reconciling VirtualMachine, VirtualMachineService, and VirtualMachineImage CRDs by making govmomi API calls to vCenter. Serves as the core runtime engine for creating and managing all VMs on the Supervisor, including VKS nodes and standalone VMs." },
      { name: "vmware-system-vmop-web-console-validator", kind: "Deployment", replicas: "1/1", role: "Auth", summary: "Lightweight HTTPS server that validates web-console (VMRC) session tokens before vCenter grants terminal access to a managed VM. Guards the VM web console endpoint against unauthorized access by verifying token authenticity on every session request." },
    ],
  },
  {
    ns: "vmware-system-zoneop",
    workloads: [
      { name: "zone-operator", kind: "Deployment", replicas: "1/1", role: "Controller", summary: "Reconciles ZoneResourceUtilization CRDs by periodically querying vCenter resource pool quick-stats (CPU/memory) for each topology zone (vSphere domain). Keeps per-zone capacity status up to date so the scheduler and autoscaler can make informed placement decisions." },
    ],
  },
];

const ROLE_COLORS: Record<RoleCategory, string> = {
  Controller:    "#4f8ef7",
  Webhook:       "#e07b39",
  Proxy:         "#9b59b6",
  "Plugin Server":"#16a085",
  Metrics:       "#27ae60",
  Logging:       "#8e44ad",
  Storage:       "#d35400",
  Auth:          "#c0392b",
  Networking:    "#2980b9",
  Packaging:     "#1abc9c",
  DNS:           "#2ecc71",
  Runtime:       "#7f8c8d",
};

const KIND_COLORS: Record<WorkloadKind, string> = {
  Deployment:   "#4f8ef7",
  DaemonSet:    "#e07b39",
  "Static Pod": "#8b949e",
  StatefulSet:  "#9b59b6",
  Job:          "#16a085",
};

const S = {
  page: {
    minHeight: "100vh",
    background: "var(--bg)",
    padding: "32px 24px",
    fontFamily: "var(--font)",
  } as React.CSSProperties,
  inner: {
    maxWidth: 1280,
    margin: "0 auto",
  } as React.CSSProperties,
  h1: {
    fontSize: 22,
    fontWeight: 700,
    color: "var(--text-primary)",
    letterSpacing: "-0.02em",
    marginBottom: 4,
  } as React.CSSProperties,
  subtitle: {
    fontSize: 13,
    color: "var(--text-secondary)",
    marginBottom: 24,
  } as React.CSSProperties,
  statsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 12,
    marginBottom: 24,
  } as React.CSSProperties,
  statCard: {
    background: "var(--bg-card)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    padding: "14px 18px",
  } as React.CSSProperties,
  statValue: {
    fontSize: 28,
    fontWeight: 700,
    color: "var(--text-primary)",
    lineHeight: 1.1,
  } as React.CSSProperties,
  statLabel: {
    fontSize: 11,
    color: "var(--text-secondary)",
    textTransform: "uppercase" as const,
    letterSpacing: "0.06em",
    marginTop: 4,
  },
  divider: {
    borderTop: "1px solid var(--border)",
    margin: "20px 0",
  } as React.CSSProperties,
  filterLabel: {
    fontSize: 11,
    fontWeight: 600,
    color: "var(--text-tertiary)",
    textTransform: "uppercase" as const,
    letterSpacing: "0.08em",
    marginBottom: 8,
  },
  pillRow: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: 6,
    marginBottom: 24,
  },
  nsSection: {
    marginBottom: 32,
  } as React.CSSProperties,
  nsHeader: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  } as React.CSSProperties,
  h2: {
    fontSize: 15,
    fontWeight: 600,
    color: "var(--text-primary)",
    fontFamily: "var(--font-mono)",
  } as React.CSSProperties,
  nsCount: {
    fontSize: 12,
    color: "var(--text-tertiary)",
  } as React.CSSProperties,
  table: {
    width: "100%",
    borderCollapse: "collapse" as const,
    border: "1px solid var(--border)",
    borderRadius: 8,
    overflow: "hidden",
    fontSize: 13,
  } as React.CSSProperties,
  th: {
    textAlign: "left" as const,
    padding: "8px 12px",
    background: "var(--bg-card)",
    color: "var(--text-secondary)",
    fontSize: 11,
    fontWeight: 600,
    textTransform: "uppercase" as const,
    letterSpacing: "0.06em",
    borderBottom: "1px solid var(--border)",
    whiteSpace: "nowrap" as const,
  },
  thCenter: {
    textAlign: "center" as const,
  },
  td: {
    padding: "8px 12px",
    borderBottom: "1px solid var(--border)",
    verticalAlign: "top" as const,
    color: "var(--text-primary)",
  } as React.CSSProperties,
  tdMono: {
    fontFamily: "var(--font-mono)",
    fontSize: 12,
    fontWeight: 600,
    color: "var(--text-primary)",
  } as React.CSSProperties,
  tdCenter: {
    textAlign: "center" as const,
  },
  tdSummary: {
    color: "var(--text-secondary)",
    fontSize: 12,
    lineHeight: 1.6,
    maxWidth: 540,
  } as React.CSSProperties,
};

function StatCard({ value, label }: { value: number | string; label: string }) {
  return (
    <div style={S.statCard}>
      <div style={S.statValue}>{value}</div>
      <div style={S.statLabel}>{label}</div>
    </div>
  );
}

function RoleBadge({ role }: { role: RoleCategory }) {
  const color = ROLE_COLORS[role];
  return (
    <span style={{
      fontSize: 11,
      fontWeight: 600,
      padding: "2px 7px",
      borderRadius: 4,
      background: color + "22",
      color,
      border: `1px solid ${color}44`,
      whiteSpace: "nowrap" as const,
    }}>
      {role}
    </span>
  );
}

function KindBadge({ kind }: { kind: WorkloadKind }) {
  return (
    <span style={{ color: KIND_COLORS[kind], fontSize: 12, fontWeight: 500 }}>
      {kind}
    </span>
  );
}

function PillButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "4px 10px",
        borderRadius: 20,
        border: "1px solid",
        borderColor: active ? "var(--accent)" : "var(--border)",
        background: active ? "rgba(79,142,247,0.12)" : "transparent",
        color: active ? "var(--accent)" : "var(--text-secondary)",
        fontSize: 12,
        cursor: "pointer",
        fontFamily: "var(--font)",
        transition: "all 0.1s",
      }}
    >
      {label}
    </button>
  );
}

const ALL_NS = "All Namespaces";

const DARK_VARS = {
  "--bg": "#0f1117", "--bg-card": "#161b22", "--bg-stripe": "#1c2128",
  "--border": "#30363d", "--text-primary": "#e6edf3", "--text-secondary": "#8b949e",
  "--text-tertiary": "#6e7681", "--accent": "#4f8ef7",
};
const LIGHT_VARS = {
  "--bg": "#ffffff", "--bg-card": "#f6f8fa", "--bg-stripe": "#f0f3f6",
  "--border": "#d0d7de", "--text-primary": "#1f2328", "--text-secondary": "#57606a",
  "--text-tertiary": "#6e7781", "--accent": "#0969da",
};

export default function App() {
  const [selectedNs, setSelectedNs] = useState(ALL_NS);
  const [dark, setDark] = useState(false);

  const theme = dark ? DARK_VARS : LIGHT_VARS;

  const allWorkloads = DATA.flatMap((d) => d.workloads);
  const totalDeployments = allWorkloads.filter((w) => w.kind === "Deployment").length;
  const totalDaemonSets = allWorkloads.filter((w) => w.kind === "DaemonSet").length;
  const totalStaticPods = allWorkloads.filter((w) => w.kind === "Static Pod").length;
  const totalWorkloads = allWorkloads.length;

  const visibleData = selectedNs === ALL_NS ? DATA : DATA.filter((d) => d.ns === selectedNs);

  return (
    <div style={{ ...S.page, ...theme as React.CSSProperties }}>
      <div style={S.inner}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 4 }}>
          <h1 style={S.h1}>vSphere Supervisor Cluster — Workload Catalog (VCF 9.1)</h1>
          <button
            onClick={() => setDark(!dark)}
            title={dark ? "Switch to light mode" : "Switch to dark mode"}
            style={{ flexShrink: 0, marginLeft: 16, marginTop: 2, padding: "5px 12px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--bg-card)", color: "var(--text-secondary)", fontSize: 12, cursor: "pointer", fontFamily: "var(--font)", whiteSpace: "nowrap" as const }}
          >
            {dark ? "Light mode" : "Dark mode"}
          </button>
        </div>
        <p style={S.subtitle}>
          Per-namespace role analysis across all deployments, daemonsets, and static pods.
          Roles inferred from workload names, logs, and VMware/CAPI domain knowledge.
        </p>

        <div style={S.statsRow}>
          <StatCard value={totalDeployments} label="Deployments" />
          <StatCard value={totalDaemonSets} label="DaemonSets" />
          <StatCard value={totalStaticPods} label="Static Pods" />
          <StatCard value={totalWorkloads} label="Total Workloads" />
        </div>

        <div style={S.divider} />

        <div style={S.filterLabel}>Filter by namespace</div>
        <div style={S.pillRow}>
          <PillButton label={ALL_NS} active={selectedNs === ALL_NS} onClick={() => setSelectedNs(ALL_NS)} />
          {DATA.map((d) => (
            <PillButton key={d.ns} label={d.ns} active={selectedNs === d.ns} onClick={() => setSelectedNs(d.ns)} />
          ))}
        </div>

        <div style={S.divider} />

        {visibleData.map((nsData) => (
          <div key={nsData.ns} style={S.nsSection}>
            <div style={S.nsHeader}>
              <span style={S.h2}>{nsData.ns}</span>
              <span style={S.nsCount}>
                {nsData.workloads.length} workload{nsData.workloads.length !== 1 ? "s" : ""}
              </span>
            </div>
            <table style={S.table}>
              <thead>
                <tr>
                  <th style={S.th}>Workload</th>
                  <th style={S.th}>Kind</th>
                  <th style={{ ...S.th, ...S.thCenter }}>Replicas</th>
                  <th style={S.th}>Role</th>
                  <th style={S.th}>Summary</th>
                </tr>
              </thead>
              <tbody>
                {nsData.workloads.map((w, i) => (
                  <tr key={w.name} style={{ background: i % 2 === 1 ? "var(--bg-stripe)" : "transparent" }}>
                    <td style={{ ...S.td, ...S.tdMono }}>{w.name}</td>
                    <td style={S.td}><KindBadge kind={w.kind} /></td>
                    <td style={{ ...S.td, ...S.tdCenter, color: "var(--text-secondary)", fontSize: 12 }}>{w.replicas}</td>
                    <td style={S.td}><RoleBadge role={w.role} /></td>
                    <td style={{ ...S.td, ...S.tdSummary }}>{w.summary}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}

        <div style={{ ...S.divider, marginTop: 40 }} />
        <p style={{ fontSize: 12, color: "var(--text-tertiary)", textAlign: "center" }}>
          vSphere Supervisor 9.1 · Cluster ID cbfe7cc4-c40f-4f39-afdb-e2a5e556e806 · Generated Jun 2026
        </p>
      </div>
    </div>
  );
}
