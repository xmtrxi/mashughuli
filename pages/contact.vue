<script setup lang="ts">
// Define types
interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface FormErrors {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface ContactInfo {
  icon: string;
  title: string;
  details: string;
  action: string;
}

// Form state
const form = reactive<FormData>({
  name: "",
  email: "",
  subject: "",
  message: "",
});

// Error state
const errors = reactive<FormErrors>({
  name: "",
  email: "",
  subject: "",
  message: "",
});

// Contact information
const contactInfo = reactive<ContactInfo[]>([
  {
    icon: "mdi:email",
    title: "Email",
    details: "hello@mashughuli.com",
    action: "mailto:hello@mashughuli.com",
  },
  {
    icon: "mdi:phone",
    title: "Phone",
    details: "+254 702 345 678",
    action: "tel:+254702345678",
  },
  {
    icon: "mdi:map-marker",
    title: "Office",
    details: "Nairobi, Kenya",
    action: "https://maps.google.com/?q=Nairobi,Kenya",
  },
  {
    icon: "mdi:message-text",
    title: "Live Chat",
    details: "Mon-Fri, 9am-5pm",
    action: "#",
  },
]);

/**
 * Validates email format
 */
const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

/**
 * Validates the form fields
 */
const validateForm = (): boolean => {
  let isValid = true;

  // Reset errors
  errors.name = "";
  errors.email = "";
  errors.subject = "";
  errors.message = "";

  // Validate name
  if (!form.name.trim()) {
    errors.name = "Name is required";
    isValid = false;
  }

  // Validate email
  if (!form.email.trim()) {
    errors.email = "Email is required";
    isValid = false;
  } else if (!validateEmail(form.email)) {
    errors.email = "Please enter a valid email address";
    isValid = false;
  }

  // Validate subject
  if (!form.subject.trim()) {
    errors.subject = "Subject is required";
    isValid = false;
  }

  // Validate message
  if (!form.message.trim()) {
    errors.message = "Message is required";
    isValid = false;
  }

  return isValid;
};

/**
 * Form submission handler
 */
const onSubmit = () => {
  if (validateForm()) {
    // Form submission logic here
    console.log("Form submitted:", form);

    // Reset form after submission
    form.name = "";
    form.email = "";
    form.subject = "";
    form.message = "";

    // Show success message (you might want to implement this with a composable/toast system)
    alert("Your message has been sent successfully!");
  }
};
</script>
<template>
  <div>
    <section
      class="bg-gradient-to-b from-primary-50 to-background py-16 md:py-24"
    >
      <div class="container mx-auto px-4 text-center">
        <h1 class="text-4xl md:text-5xl font-bold mb-6">Get in Touch</h1>
        <p class="text-xl text-muted-foreground max-w-3xl mx-auto">
          Have questions about Mashughuli? Need help with your account? Our team
          is ready to assist you.
        </p>
      </div>
    </section>

    <!-- Contact Section -->
    <section class="py-16 bg-background">
      <div class="container mx-auto px-4">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <!-- Contact Form -->
          <div class="bg-card rounded-lg shadow p-8">
            <h2 class="text-2xl font-semibold mb-6">Send Us a Message</h2>

            <form @submit.prevent="onSubmit" class="space-y-6">
              <div class="space-y-2">
                <label for="name" class="block font-medium">Name</label>
                <input
                  id="name"
                  v-model="form.name"
                  type="text"
                  placeholder="Your Name"
                  class="w-full p-2 border rounded-md"
                  :class="{ 'border-red-500': errors.name }"
                />
                <p v-if="errors.name" class="text-red-500 text-sm">
                  {{ errors.name }}
                </p>
              </div>

              <div class="space-y-2">
                <label for="email" class="block font-medium">Email</label>
                <input
                  id="email"
                  v-model="form.email"
                  type="email"
                  placeholder="your.email@example.com"
                  class="w-full p-2 border rounded-md"
                  :class="{ 'border-red-500': errors.email }"
                />
                <p v-if="errors.email" class="text-red-500 text-sm">
                  {{ errors.email }}
                </p>
              </div>

              <div class="space-y-2">
                <label for="subject" class="block font-medium">Subject</label>
                <input
                  id="subject"
                  v-model="form.subject"
                  type="text"
                  placeholder="What's this about?"
                  class="w-full p-2 border rounded-md"
                  :class="{ 'border-red-500': errors.subject }"
                />
                <p v-if="errors.subject" class="text-red-500 text-sm">
                  {{ errors.subject }}
                </p>
              </div>

              <div class="space-y-2">
                <label for="message" class="block font-medium">Message</label>
                <textarea
                  id="message"
                  v-model="form.message"
                  placeholder="How can we help you?"
                  class="w-full p-2 border rounded-md min-h-[150px]"
                  :class="{ 'border-red-500': errors.message }"
                ></textarea>
                <p v-if="errors.message" class="text-red-500 text-sm">
                  {{ errors.message }}
                </p>
              </div>

              <button
                type="submit"
                class="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-md"
              >
                Submit Message
              </button>
            </form>
          </div>

          <!-- Contact Information -->
          <div class="space-y-8">
            <div>
              <h2 class="text-2xl font-semibold mb-6">Contact Information</h2>
              <p class="text-muted-foreground mb-8">
                Whether you're looking for support, have feedback, or want to
                explore business opportunities, we're here to help. Reach out to
                us using any of the methods below.
              </p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div
                v-for="(item, index) in contactInfo"
                :key="index"
                class="bg-card p-6 rounded-lg shadow-sm"
              >
                <div class="flex items-center space-x-4">
                  <div class="bg-primary-50 p-3 rounded-full">
                    <Icon :name="item.icon" class="h-5 w-5 text-primary-500" />
                  </div>
                  <div>
                    <h3 class="font-medium">{{ item.title }}</h3>
                    <a
                      :href="item.action"
                      class="text-primary-600 hover:underline"
                      :target="item.title === 'Office' ? '_blank' : undefined"
                      :rel="item.title === 'Office' ? 'noreferrer' : undefined"
                    >
                      {{ item.details }}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div class="mt-12">
              <h3 class="text-xl font-medium mb-4">Business Hours</h3>
              <div class="space-y-2 text-muted-foreground">
                <div class="flex justify-between">
                  <span>Monday - Friday:</span>
                  <span>9:00 AM - 5:00 PM</span>
                </div>
                <div class="flex justify-between">
                  <span>Saturday:</span>
                  <span>10:00 AM - 2:00 PM</span>
                </div>
                <div class="flex justify-between">
                  <span>Sunday:</span>
                  <span>Closed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ Section -->
    <section class="py-16 bg-primary-50">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl font-bold mb-12 text-center">
          Frequently Asked Questions
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div class="bg-background p-6 rounded-lg shadow-sm">
            <h3 class="text-xl font-semibold mb-3">
              How do I become a runner?
            </h3>
            <p class="text-muted-foreground">
              Sign up for a Mashughuli account, complete your profile, and
              select the "Become a Runner" option in your dashboard. You'll need
              to complete a brief verification process before you can start
              accepting errands.
            </p>
          </div>

          <div class="bg-background p-6 rounded-lg shadow-sm">
            <h3 class="text-xl font-semibold mb-3">How do payments work?</h3>
            <p class="text-muted-foreground">
              We offer secure in-app payments through mobile money, credit
              cards, and bank transfers. Funds are held securely until an errand
              is completed, then released to the runner minus our service fee.
            </p>
          </div>

          <div class="bg-background p-6 rounded-lg shadow-sm">
            <h3 class="text-xl font-semibold mb-3">Can I cancel an errand?</h3>
            <p class="text-muted-foreground">
              Yes, you can cancel an errand before a runner accepts it without
              any penalty. If a runner has already accepted, cancellation fees
              may apply depending on the circumstances.
            </p>
          </div>

          <div class="bg-background p-6 rounded-lg shadow-sm">
            <h3 class="text-xl font-semibold mb-3">Is there a mobile app?</h3>
            <p class="text-muted-foreground">
              Yes! Our mobile apps for Android and iOS are currently in beta
              testing and will be launched soon. Sign up on our website to be
              notified when they're available.
            </p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
