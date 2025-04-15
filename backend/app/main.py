from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .models import SearchRequest, SearchResponse, SearchResult
from .search_algorithms import uniform_cost_search, convert_graph_dict

app = FastAPI()

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/search", response_model=SearchResponse)
async def search(request: SearchRequest):
    # Converter o grafo do formato do frontend para o formato da busca
    graph = convert_graph_dict(request.graph)
    
    # Executar a busca
    paths = uniform_cost_search(
        graph=graph,
        start_node=request.startNode,
        goal_nodes=set(request.goalNodes)
    )
    
    # Converter os resultados para o formato esperado pelo frontend
    results = []
    for path_nodes, total_cost, steps in paths:
        path = []
        for node_id in path_nodes:
            node = graph[node_id]
            path.append({"id": node.id, "value": node.value})
        
        results.append(SearchResult(
            path=path,
            cost=total_cost,
            steps=steps
        ))
    
    return SearchResponse(results=results) 