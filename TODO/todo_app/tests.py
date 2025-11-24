import json
from django.test import TestCase, Client
from django.urls import reverse
from .models import Todo

class TodoModelTest(TestCase):
    def test_create_todo(self):
        todo = Todo.objects.create(title="Test Todo", description="Test Description")
        self.assertEqual(todo.title, "Test Todo")
        self.assertEqual(todo.description, "Test Description")
        self.assertFalse(todo.is_resolved)
        self.assertEqual(str(todo), "Test Todo")

class TodoViewTest(TestCase):
    def setUp(self):
        self.client = Client()
        self.todo = Todo.objects.create(title="Existing Todo", description="Existing Description")
        self.list_url = reverse('todo_list')
        self.detail_url = reverse('todo_detail', args=[self.todo.id])

    def test_get_todo_list_template(self):
        """Test that the list view renders the correct template"""
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'todo_app/home.html')
        self.assertContains(response, "Existing Todo")

    def test_create_todo_api(self):
        """Test creating a todo via POST API"""
        data = {
            'title': 'New API Todo',
            'description': 'Created via API',
            'is_resolved': False
        }
        response = self.client.post(
            self.list_url,
            data=json.dumps(data),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(Todo.objects.count(), 2)
        self.assertEqual(response.json()['title'], 'New API Todo')

    def test_get_todo_detail_api(self):
        """Test retrieving a specific todo via API"""
        response = self.client.get(self.detail_url)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data['title'], "Existing Todo")

    def test_update_todo_api(self):
        """Test updating a todo via PUT API"""
        data = {
            'title': 'Updated Todo',
            'is_resolved': True
        }
        response = self.client.put(
            self.detail_url,
            data=json.dumps(data),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 200)
        
        self.todo.refresh_from_db()
        self.assertEqual(self.todo.title, 'Updated Todo')
        self.assertTrue(self.todo.is_resolved)

    def test_delete_todo_api(self):
        """Test deleting a todo via DELETE API"""
        response = self.client.delete(self.detail_url)
        self.assertEqual(response.status_code, 204)
        self.assertEqual(Todo.objects.count(), 0)

    def test_get_nonexistent_todo(self):
        """Test getting a todo that doesn't exist"""
        url = reverse('todo_detail', args=[999])
        response = self.client.get(url)
        self.assertEqual(response.status_code, 404)

