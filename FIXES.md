Fixes:

1. The home page looks a bit naked and too simple, maybe could be improved a little,
hero section image or something, need to come up with some variants.
2. The generic pages look ugly and the content is very narrow compared to other pages. Please fix using some components
from TailwindPlus.
3. Form component looks pretty ugly, need to use some better component.
4. Find my order page looks ugly, not even sure if it's needed, maybe could be a modal instead. 
5. Need to reuse components as much as possible for consistency, f.e. forms look a bit different on different pages.
6. Pages should have a minimum height, otherwise the footer will be in the middle if there is not enough content.
7. Order page looks a bit off, the boxes are consistent with other pages, but the f.e.
I don't like the Total and number is far away to the side. The UX here could be improved.
8. There is no pagination anywhere, products are loaded all at once, order history too, it will start breaking 
soon with bigger amounts of products and orders.
9. Not everyone will be using Stripe, actually it will be one of the most unused payment methods. Most will need Lithuanian
banks, cards, apple pay or google pay. For LT banks there is Paysera and Neopay options. For other options need to check.
I need to have a flexible architecture for payment methods, so that it's easy to add new integrations and also I need a way to choose
the methods in settings.
10. The product page contains hardcoded shipping costs, returns etc. It needs to be configured somewhere in the backend.

11. Questions for clarification:

1. What is the purpose of having repos in backend? I mean it could be used for some statistics in the future,
   also it allows the user to come back to his cart even with a cleared cache / different device. But it takes time to load,
    when we could use local storage and it would be much faster.
2. Right now there are all kinds of hooks added to collections, f.e. adding products to Stripe. I need to disable adding products to Stripe if f.e.
I will be using Paysera instead. I need to make this flexible and make sense. Need to design proper, solid architecture.
