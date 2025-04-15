from typing import List, Dict, Set, Tuple
from queue import PriorityQueue
from .models import Node, SearchStep, SearchResult

def uniform_cost_search(graph: Dict[str, Node], start_node: str, goal_nodes: Set[str]) -> List[Tuple[List[Node], float, List[SearchStep]]]:
    # Fila de prioridade para armazenar os caminhos
    frontier = PriorityQueue()
    frontier.put((0, [start_node]))
    
    # Conjunto para armazenar os nós explorados
    explored = set()
    
    # Lista para armazenar os passos da busca
    steps = []
    
    # Variáveis para armazenar o melhor caminho
    best_path = None
    best_cost = float('inf')
    best_steps = None
    
    while not frontier.empty():
        # Obtém o caminho com menor custo
        cost, path = frontier.get()
        node = path[-1]
        
        # Registrar o passo atual
        frontier_content = []
        temp_frontier = PriorityQueue()
        while not frontier.empty():
            c, p = frontier.get()
            frontier_content.append((c, p))
            temp_frontier.put((c, p))
        frontier = temp_frontier

        step = SearchStep(
            current_node=node,
            frontier=frontier_content,
            explored=list(explored),
            current_path=path,
            current_cost=cost
        )
        steps.append(step)
        
        # Se o nó atual é um objetivo e tem custo menor que o melhor até agora
        if node in goal_nodes and cost < best_cost:
            best_path = path
            best_cost = cost
            best_steps = list(steps)  # Faz uma cópia dos passos até aqui
        
        # Se o nó já foi explorado ou o custo já é maior que o melhor, pula
        if node in explored or cost >= best_cost:
            continue
            
        # Marca o nó como explorado
        explored.add(node)
        
        # Explora os vizinhos
        current_node = graph[node]
        for neighbor_id, edge_cost in current_node.neighbors.items():
            if neighbor_id not in explored:
                new_path = list(path)
                new_path.append(neighbor_id)
                new_cost = cost + edge_cost
                # Só adiciona à fronteira se o custo for menor que o melhor até agora
                if new_cost < best_cost:
                    frontier.put((new_cost, new_path))
    
    # Retorna o melhor caminho encontrado ou lista vazia se não encontrou nenhum
    return [(best_path, best_cost, best_steps)] if best_path else []

def convert_graph_dict(graph_dict: Dict) -> Dict[str, Node]:
    converted_graph = {}
    for node_id, node_data in graph_dict.items():
        converted_graph[node_id] = Node(
            id=node_data['id'],
            value=node_data['value'],
            neighbors=node_data['neighbors']
        )
    return converted_graph 