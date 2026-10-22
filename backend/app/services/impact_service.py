from typing import Dict, Any, List


def map_findings_to_graph(findings: List[Dict[str, Any]], graph: Dict[str, Any]) -> Dict[str, Any]:
    """
    Connects vulnerability findings with the Graphify structural code graph.
    Propagates impact to upstream callers and downstream dependencies.
    """
    if not graph or "nodes" not in graph:
        return {"nodes": [], "edges": []}

    nodes = [dict(n) for n in graph["nodes"]]
    edges = [dict(e) for e in graph.get("edges", [])]

    # Map findings to the most relevant node
    for finding in findings:
        matched = False
        comp_name = finding.get("component", "").lower()
        file_name = finding.get("file", "").lower()

        for node in nodes:
            node_label = node.get("data", {}).get("label", "").lower()
            node_file = node.get("data", {}).get("file", "").lower()

            if (comp_name and comp_name in node_label) or (file_name and file_name in node_file) or ("sink" in node_label or "db" in node_label):
                node["data"]["risk"] = "vulnerable"
                node["data"]["findingId"] = finding.get("id")
                node["data"]["description"] = f"Vulnerable code location: {finding.get('title')}"
                matched = True

                # Mark incoming callers as 'affected'
                for edge in edges:
                    if edge.get("target") == node.get("id"):
                        edge["style"] = {"stroke": "#ef4444", "strokeWidth": 2.5}
                        edge["animated"] = True
                        for caller_node in nodes:
                            if caller_node.get("id") == edge.get("source") and caller_node.get("data", {}).get("risk") != "vulnerable":
                                caller_node["data"]["risk"] = "affected"

                    # Mark outgoing as 'dependency'
                    elif edge.get("source") == node.get("id"):
                        edge["style"] = {"stroke": "#f59e0b", "strokeWidth": 2}
                        for dep_node in nodes:
                            if dep_node.get("id") == edge.get("target") and dep_node.get("data", {}).get("risk") not in ["vulnerable", "affected"]:
                                dep_node["data"]["risk"] = "dependency"
                break

    return {"nodes": nodes, "edges": edges}

