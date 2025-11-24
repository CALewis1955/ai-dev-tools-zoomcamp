import json
from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import Todo

@csrf_exempt
def todo_list(request):
    if request.method == 'GET':
        todos = Todo.objects.filter(is_resolved=False).order_by('-created_at')
        return render(request, 'todo_app/home.html', {'todos': todos})
    
    elif request.method == 'POST':
        try:
            data = json.loads(request.body)
            todo = Todo.objects.create(
                title=data.get('title'),
                description=data.get('description'),
                due_date=data.get('due_date'),
                is_resolved=data.get('is_resolved', False)
            )
            return JsonResponse({
                'id': todo.id,
                'title': todo.title,
                'description': todo.description,
                'due_date': todo.due_date,
                'is_resolved': todo.is_resolved,
                'created_at': todo.created_at,
                'updated_at': todo.updated_at
            }, status=201)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

def resolved_todos(request):
    todos = Todo.objects.filter(is_resolved=True).order_by('-created_at')
    return render(request, 'todo_app/resolved_todos.html', {'todos': todos})

@csrf_exempt
def todo_detail(request, pk):
    todo = get_object_or_404(Todo, pk=pk)

    if request.method == 'GET':
        return render(request, 'todo_app/todo_detail.html', {'todo': todo})
    
    elif request.method == 'PUT':
        try:
            data = json.loads(request.body)
            todo.title = data.get('title', todo.title)
            todo.description = data.get('description', todo.description)
            todo.due_date = data.get('due_date', todo.due_date)
            todo.is_resolved = data.get('is_resolved', todo.is_resolved)
            todo.save()
            return JsonResponse({
                'id': todo.id,
                'title': todo.title,
                'description': todo.description,
                'due_date': todo.due_date,
                'is_resolved': todo.is_resolved,
                'created_at': todo.created_at,
                'updated_at': todo.updated_at
            })
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
            
    elif request.method == 'DELETE':
        todo.delete()
        return JsonResponse({'message': 'Todo deleted successfully'}, status=204)

