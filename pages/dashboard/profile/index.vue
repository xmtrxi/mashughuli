<script setup lang="ts">
import {buttonVariants} from "~/components/ui/button";

const authUser = useAuthStore();
</script>

<template>
  <div class="max-w-3xl mx-auto py-10 px-6">
    <div class="bg-white shadow-xl rounded-2xl p-6">
      <h2 class="text-2xl font-semibold text-gray-800 mb-4">My Profile</h2>

      <div class="flex items-center space-x-6">
        <img src="#"
             alt="Profile Picture"
             class="w-24 h-24 rounded-full object-cover shadow">

        <div class="flex-col space-y-3">
          <h3 class="text-xl font-bold text-gray-900"> Name :John Doe</h3>
          <p class="text-gray-600 text-lg" >Email:johndoe@example.com</p>
          <p class="text-gray-600 text-lg">Member since Jan 2023</p>
          <p class="text-gray-600 text-lg">Email: johndoe@example.com</p>
          <p class="text-gray-500 text-lg">Dob: 01/01/2000</p>


        </div>
      </div>

      <div class="mt-6 flex space-x-4">
        <NuxtLink
            to="profile/edit"
            :class="buttonVariants({ variant: 'default' })"
        >
          <Icon name="mdi:edit" />
          Edit Profile
        </NuxtLink>

        <form method="POST" action="/profile/update">
          <!-- Add CSRF token if needed -->
          <input type="hidden" name="name" value="John Doe">
          <button type="submit"
                  class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition">
            Update Profile
          </button>
        </form>
      </div>
    </div>

    <div class="max-w-3xl mx-auto py-10 px-6 invisible">
      <div class="bg-white shadow-xl rounded-2xl p-6">
        <h2 class="text-2xl font-semibold text-gray-800 mb-4">Edit Profile</h2>

        <form method="POST" action="#" enctype="multipart/form-data" class="space-y-6">
          <!-- You can include @csrf in Blade -->

          <div class="flex items-center space-x-6">
            <div>
              <label for="profile_photo" class="block text-sm font-medium text-gray-700">Profile Photo</label>
              <input type="file" id="profile_photo" name="profile_photo"
                     class="mt-1 block w-full text-sm text-gray-700 border rounded-md p-2">
            </div>

            <img src="#"
                 alt="Profile Picture Preview"
                 class="w-24 h-24 rounded-full object-cover shadow">
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Full Name</label>
            <input type="text" name="name" value="John Doe"
                   class="mt-1 block w-full border border-gray-300 rounded-lg p-2 focus:ring focus:ring-blue-200">
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" name="email" value="johndoe@example.com"
                   class="mt-1 block w-full border border-gray-300 rounded-lg p-2 focus:ring focus:ring-blue-200">
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Date of Birth</label>
            <input type="date" name="dob" value="2000-01-01"
                   class="mt-1 block w-full border border-gray-300 rounded-lg p-2 focus:ring focus:ring-blue-200">
          </div>

          <div class="pt-4">
            <button type="submit"
                    class="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition">
              Save Changes
            </button>
            <a href="/profile"
               class="ml-3 text-gray-600 hover:text-gray-800 underline">
              Cancel
            </a>
          </div>
        </form>
      </div>
    </div>

  </div>

</template>

<style scoped>

</style>