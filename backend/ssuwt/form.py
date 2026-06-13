from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import Group, User
from django import forms


class CustomUserCreationForm(UserCreationForm):
    group = forms.ModelChoiceField(
        queryset=Group.objects.all(),
        required=True,
        widget=forms.RadioSelect,
        label="Группа (обязательна)"
    )

    class Meta:
        model = User
        fields = ("username", "password1", "password2", "group")

    def save(self, commit=True):
        user = super().save(commit=False)
        if commit:
            user.save()
            user.groups.set([self.cleaned_data["group"]])
        return user